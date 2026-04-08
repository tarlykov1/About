-- ============================================================================
-- Расчет выручки сотрудников по закрытым заявкам Service Desk (PostgreSQL)
--
-- Скрипт построен как прозрачный pipeline из CTE:
--   1) params               - удобные параметры периода/заявки
--   2) call_service         - безопасная привязка заявки к услуге (анти-дубли)
--   3) source_task          - источник TASK-строк (task + workrecord)
--   4) source_service       - источник SERVICE-строк (workrecord без task)
--   5) source_data          - нормализация + бизнес-флаги + формулы стоимости
--   6) raw_data             - агрегация по сотруднику и группе (task/package)
--   7) group_employee_cnt   - число сотрудников в группе
--   8) calc_data            - расчет групповых часов
--   9) final_calc           - расчет выручки сотрудника
--  10) итоговый SELECT      - форматированный вывод
--
-- ВАЖНО:
-- - id_call всегда = sc.id (не используем id из tbl_servicec$accessca_providea как ключ заявки).
-- - Коэффициент заявки применяется только к SERVICE-строкам.
-- - TASK-строки никогда не схлопываются в пакет.
-- ============================================================================

WITH
params AS (
    SELECT
        -- Период (включительно). Поставьте нужные даты.
        -- Если фильтр не нужен, оставьте NULL.
        CAST(NULL AS timestamp) AS p_date_from,
        CAST(NULL AS timestamp) AS p_date_to,

        -- Фильтр по конкретной заявке (например, 'REQ-12345').
        CAST(NULL AS text) AS p_sc_title,

        -- Альтернатива: фильтр по номеру заявки.
        CAST(NULL AS text) AS p_sc_number
),

/*
 * Привязка заявки к услуге через scd + ts.
 * Потенциальный риск дублей: у одной заявки может быть несколько записей в scd.
 * Чтобы не раздувать строки до агрегации трудозатрат, берем 1 "актуальную" услугу на заявку.
 * Критерий выбора (ORDER BY scd.id DESC) при необходимости адаптируйте к вашей модели.
 */
call_service AS (
    SELECT DISTINCT ON (sc.id)
        sc.id                                 AS id_call,
        ts.id                                 AS service_id,
        ts.title                              AS service_name,
        ts.code                               AS service_code,
        f.formula                             AS formula_code
    FROM tbl_servicecall sc
    LEFT JOIN tbl_servicec$accessca_providea scd
        ON scd.ownerid = sc.id
    LEFT JOIN tbl_slmservice ts
        ON ts.id = scd.accessca$providea
    LEFT JOIN tbl_formula f
        ON f.id = ts.formula
    ORDER BY sc.id, scd.id DESC
),

/*
 * TASK-источник:
 * - берем workrecord, привязанные к task
 * - считаем стоимость строки taskcost -> tasktype price
 * - скрытые авто-задачи не отбрасываем (если есть трудозатраты)
 * - номера авто-задач: AUTO_TASK_<task.id>
 */
source_task AS (
    SELECT
        sc.id                                                        AS id_call,
        sc.title                                                     AS call_title,
        sc.number_                                                   AS call_number,
        sc.statestarttime                                            AS call_state_start_time,

        cs.service_id,
        cs.service_name,
        cs.service_code,
        cs.formula_code,

        task.id                                                      AS task_id,
        COALESCE(task.title, 'AUTO_TASK_' || task.id::text)         AS nomer,
        COALESCE(tt2.title, 'TASK_WITHOUT_TASKTYPE')                AS task_name,

        wr.employee                                                  AS employee_id,
        wr.time                                                      AS wr_time,
        COALESCE(task.taskcost, tt2."tasktype$price", 0::numeric)   AS tt_price,

        'TASK'::text                                                 AS source_kind,

        -- Для TASK коэффициент всегда 1 (критично по ТЗ)
        1::numeric                                                   AS call_coefficient,
        0::int                                                       AS has_coefficient
    FROM tbl_workrecord wr
    JOIN tbl_task task
        ON task.id = wr.task
    LEFT JOIN tbl_tasktype tt2
        ON tt2.id = task.tasktype
    JOIN tbl_servicecall sc
        ON sc.id = task.ownerid
    JOIN call_service cs
        ON cs.id_call = sc.id
    JOIN tbl_sys_metainfo_states sms
        ON sms.id = sc.state
    LEFT JOIN tbl_closurecode cc
        ON cc.id = sc.codeofclosing
    CROSS JOIN params p
    WHERE 1=1
      AND wr.task IS NOT NULL
      AND COALESCE(wr.time, 0) > 0
      AND sms.code = 'closed'
      AND (
            (cs.service_name = 'Инициализация проекта' AND cc.code = 'rejected')
            OR
            (COALESCE(cs.service_name, '') <> 'Инициализация проекта' AND cc.code = 'resolved')
          )
      AND COALESCE(cs.formula_code, '') <> 'Z'
      AND (p.p_date_from IS NULL OR sc.statestarttime >= p.p_date_from)
      AND (p.p_date_to   IS NULL OR sc.statestarttime <= p.p_date_to)
      AND (p.p_sc_title  IS NULL OR sc.title = p.p_sc_title)
      AND (p.p_sc_number IS NULL OR sc.number_::text = p.p_sc_number)
),

/*
 * SERVICE-источник:
 * - workrecord по заявке без task
 * - стоимость из tasktype price
 * - коэффициент заявки учитываем только здесь
 */
source_service AS (
    SELECT
        sc.id                                                        AS id_call,
        sc.title                                                     AS call_title,
        sc.number_                                                   AS call_number,
        sc.statestarttime                                            AS call_state_start_time,

        cs.service_id,
        cs.service_name,
        cs.service_code,
        cs.formula_code,

        tt2.id                                                       AS task_id,
        sc.title                                                     AS nomer,
        COALESCE(tt2.title, 'SERVICE_WITHOUT_TASKTYPE')             AS task_name,

        wr.employee                                                  AS employee_id,
        wr.time                                                      AS wr_time,
        COALESCE(tt2."tasktype$price", 0::numeric)                 AS tt_price,

        'SERVICE'::text                                              AS source_kind,

        COALESCE(sc."isaccesscall$empnum", sc."organizcall$empnum", sc."accesscall$empnum", 1::numeric)
                                                                    AS call_coefficient,
        CASE
            WHEN COALESCE(sc."isaccesscall$empnum", sc."organizcall$empnum", sc."accesscall$empnum", 1::numeric) <> 1::numeric
                THEN 1 ELSE 0
        END                                                          AS has_coefficient
    FROM tbl_workrecord wr
    JOIN tbl_servicecall sc
        ON sc.id = wr.servicecall
    LEFT JOIN tbl_tasktype tt2
        ON tt2.id = wr.tasktype
    JOIN call_service cs
        ON cs.id_call = sc.id
    JOIN tbl_sys_metainfo_states sms
        ON sms.id = sc.state
    LEFT JOIN tbl_closurecode cc
        ON cc.id = sc.codeofclosing
    CROSS JOIN params p
    WHERE 1=1
      AND wr.task IS NULL
      AND COALESCE(wr.time, 0) > 0
      AND sms.code = 'closed'
      AND (
            (cs.service_name = 'Инициализация проекта' AND cc.code = 'rejected')
            OR
            (COALESCE(cs.service_name, '') <> 'Инициализация проекта' AND cc.code = 'resolved')
          )
      AND COALESCE(cs.formula_code, '') <> 'Z'
      AND (p.p_date_from IS NULL OR sc.statestarttime >= p.p_date_from)
      AND (p.p_date_to   IS NULL OR sc.statestarttime <= p.p_date_to)
      AND (p.p_sc_title  IS NULL OR sc.title = p.p_sc_title)
      AND (p.p_sc_number IS NULL OR sc.number_::text = p.p_sc_number)
),

source_data AS (
    SELECT * FROM source_task
    UNION ALL
    SELECT * FROM source_service
),

/*
 * Нормализация и расчет стоимостей:
 * - is_package_task и group_task_key определяют схлопывание только SERVICE-стандартных задач.
 * - TASK не попадает в пакет даже при совпадении названия.
 * - "Сумма без НДС" = базовая стоимость (tt_price), без повторного умножения на коэффициент.
 * - "Сумма с трудозатратами без НДС":
 *      FORMULA='B' -> tt_price * time
 *      иначе      -> фиксированная tt_price
 *   и только для SERVICE умножаем на коэффициент заявки.
 */
raw_data AS (
    SELECT
        s.id_call,
        s.call_title,
        s.call_number,
        s.service_id,
        s.service_name,
        s.service_code,
        s.formula_code,
        s.employee_id,
        s.source_kind,
        s.has_coefficient,
        s.call_coefficient,

        CASE
            WHEN s.source_kind = 'SERVICE' AND s.service_name = 'Организация нового рабочего места'
                 AND s.task_name IN (
                    'Настройка АРМ',
                    'Подключение КМТ к АРМ',
                    'Установка АРМ',
                    'Установка базового программного обеспечения',
                    'Установка\\настройка телефонного аппарата',
                    'Установка пользовательской операционной системы'
                 ) THEN 1
            WHEN s.source_kind = 'SERVICE' AND s.service_name = 'Сопровождение переезда'
                 AND s.task_name IN (
                    'Отключение АРМ\\КМТ для перемещения пределах одного здания',
                    'Установка АРМ\\КМТ после перемещения в пределах одного здания'
                 ) THEN 1
            ELSE 0
        END AS is_package_task,

        CASE
            WHEN s.source_kind = 'SERVICE' AND s.service_name = 'Организация нового рабочего места'
                 AND s.task_name IN (
                    'Настройка АРМ',
                    'Подключение КМТ к АРМ',
                    'Установка АРМ',
                    'Установка базового программного обеспечения',
                    'Установка\\настройка телефонного аппарата',
                    'Установка пользовательской операционной системы'
                 ) THEN '__PACKAGE__'
            WHEN s.source_kind = 'SERVICE' AND s.service_name = 'Сопровождение переезда'
                 AND s.task_name IN (
                    'Отключение АРМ\\КМТ для перемещения пределах одного здания',
                    'Установка АРМ\\КМТ после перемещения в пределах одного здания'
                 ) THEN '__PACKAGE__'
            ELSE s.nomer
        END AS group_task_key,

        -- Для читабельности в итоге показываем объединенные названия задач и номеров.
        string_agg(DISTINCT s.task_name, ' | ' ORDER BY s.task_name) AS task_name_agg,
        string_agg(DISTINCT s.nomer, ' | ' ORDER BY s.nomer)         AS nomer_agg,

        -- Базовая сумма без НДС: без повторного умножения на коэффициент.
        SUM(s.tt_price) AS amount_wo_vat,

        -- Сумма с трудозатратами без НДС (формулы B / fixed) + коэффициент только для SERVICE.
        SUM(
            CASE
                WHEN s.formula_code = 'B' THEN s.tt_price * s.wr_time
                ELSE s.tt_price
            END
            * CASE WHEN s.source_kind = 'SERVICE' THEN s.call_coefficient ELSE 1::numeric END
        ) AS amount_labor_wo_vat,

        -- Raw_Количество часов с пакетным делением.
        ROUND(SUM(
            CASE
                WHEN s.source_kind = 'SERVICE'
                     AND s.service_name = 'Организация нового рабочего места'
                     AND s.task_name IN (
                        'Настройка АРМ',
                        'Подключение КМТ к АРМ',
                        'Установка АРМ',
                        'Установка базового программного обеспечения',
                        'Установка\\настройка телефонного аппарата',
                        'Установка пользовательской операционной системы'
                     )
                    THEN s.wr_time / 6.0
                WHEN s.source_kind = 'SERVICE'
                     AND s.service_name = 'Сопровождение переезда'
                     AND s.task_name IN (
                        'Отключение АРМ\\КМТ для перемещения пределах одного здания',
                        'Установка АРМ\\КМТ после перемещения в пределах одного здания'
                     )
                    THEN s.wr_time / 2.0
                ELSE s.wr_time
            END
        )::numeric, 2) AS raw_hours
    FROM source_data s
    GROUP BY
        s.id_call,
        s.call_title,
        s.call_number,
        s.service_id,
        s.service_name,
        s.service_code,
        s.formula_code,
        s.employee_id,
        s.source_kind,
        s.has_coefficient,
        s.call_coefficient,
        CASE
            WHEN s.source_kind = 'SERVICE' AND s.service_name = 'Организация нового рабочего места'
                 AND s.task_name IN (
                    'Настройка АРМ',
                    'Подключение КМТ к АРМ',
                    'Установка АРМ',
                    'Установка базового программного обеспечения',
                    'Установка\\настройка телефонного аппарата',
                    'Установка пользовательской операционной системы'
                 ) THEN 1
            WHEN s.source_kind = 'SERVICE' AND s.service_name = 'Сопровождение переезда'
                 AND s.task_name IN (
                    'Отключение АРМ\\КМТ для перемещения пределах одного здания',
                    'Установка АРМ\\КМТ после перемещения в пределах одного здания'
                 ) THEN 1
            ELSE 0
        END,
        CASE
            WHEN s.source_kind = 'SERVICE' AND s.service_name = 'Организация нового рабочего места'
                 AND s.task_name IN (
                    'Настройка АРМ',
                    'Подключение КМТ к АРМ',
                    'Установка АРМ',
                    'Установка базового программного обеспечения',
                    'Установка\\настройка телефонного аппарата',
                    'Установка пользовательской операционной системы'
                 ) THEN '__PACKAGE__'
            WHEN s.source_kind = 'SERVICE' AND s.service_name = 'Сопровождение переезда'
                 AND s.task_name IN (
                    'Отключение АРМ\\КМТ для перемещения пределах одного здания',
                    'Установка АРМ\\КМТ после перемещения в пределах одного здания'
                 ) THEN '__PACKAGE__'
            ELSE s.nomer
        END
    HAVING ROUND(SUM(
            CASE
                WHEN s.source_kind = 'SERVICE'
                     AND s.service_name = 'Организация нового рабочего места'
                     AND s.task_name IN (
                        'Настройка АРМ',
                        'Подключение КМТ к АРМ',
                        'Установка АРМ',
                        'Установка базового программного обеспечения',
                        'Установка\\настройка телефонного аппарата',
                        'Установка пользовательской операционной системы'
                     )
                    THEN s.wr_time / 6.0
                WHEN s.source_kind = 'SERVICE'
                     AND s.service_name = 'Сопровождение переезда'
                     AND s.task_name IN (
                        'Отключение АРМ\\КМТ для перемещения пределах одного здания',
                        'Установка АРМ\\КМТ после перемещения в пределах одного здания'
                     )
                    THEN s.wr_time / 2.0
                ELSE s.wr_time
            END
        )::numeric, 2) > 0
),

group_employee_cnt AS (
    SELECT
        id_call,
        group_task_key,
        COUNT(DISTINCT employee_id) AS employee_cnt
    FROM raw_data
    GROUP BY id_call, group_task_key
),

calc_data AS (
    SELECT
        r.*,
        r.raw_hours AS spent_hours,
        SUM(r.raw_hours) OVER (PARTITION BY r.id_call, r.group_task_key) AS total_group_hours,
        gec.employee_cnt
    FROM raw_data r
    JOIN group_employee_cnt gec
      ON gec.id_call = r.id_call
     AND gec.group_task_key = r.group_task_key
),

final_calc AS (
    SELECT
        c.*,
        CASE
            WHEN c.formula_code = 'B' THEN c.amount_labor_wo_vat
            WHEN c.has_coefficient = 1 AND c.employee_cnt = 1 THEN c.amount_labor_wo_vat
            WHEN c.has_coefficient = 1 AND c.employee_cnt > 1 THEN
                CASE WHEN c.total_group_hours = 0 THEN 0
                     ELSE (c.amount_labor_wo_vat * c.spent_hours) / c.total_group_hours
                END
            ELSE
                CASE WHEN c.total_group_hours = 0 THEN 0
                     ELSE (c.amount_wo_vat * c.spent_hours) / c.total_group_hours
                END
        END AS employee_revenue_wo_vat,

        CASE
            WHEN c.formula_code = 'B'
                THEN 'FORMULA=B => Выручка = Сумма с трудозатратами без НДС'
            WHEN c.has_coefficient = 1 AND c.employee_cnt = 1
                THEN 'Коэфф. заявка, 1 сотрудник => Выручка = Сумма с трудозатратами без НДС'
            WHEN c.has_coefficient = 1 AND c.employee_cnt > 1
                THEN '(Сумма с трудозатратами без НДС * Затраченное время) / Количество часов отраженные всего'
            ELSE
                '(Сумма без НДС * Затраченное время) / Количество часов отраженные всего'
        END AS formula_text
    FROM calc_data c
)

SELECT
    ou_requester.title                                                  AS "Организация заявителя",
    bl.title                                                            AS "Блок сотрудника",
    ou_emp.title                                                        AS "Отдел сотрудника",
    emp.title                                                           AS "ФИО сотрудника",

    fc.task_name_agg                                                    AS "Наименование задачи",
    fc.service_code                                                     AS "Код услуги",
    fc.call_title                                                       AS "Номер заявки",
    fc.nomer_agg                                                        AS "Номер задачи",

    to_char(round(fc.amount_wo_vat, 2), 'FM999999999990.##')          AS "Сумма без НДС",
    to_char(round(fc.amount_labor_wo_vat, 2), 'FM999999999990.##')    AS "Сумма с трудозатратами без НДС",
    to_char(round(fc.spent_hours, 2), 'FM999999999990.##')            AS "Затраченное время",
    to_char(round(fc.total_group_hours, 2), 'FM999999999990.##')      AS "Количество часов отраженные всего",
    to_char(round(fc.employee_revenue_wo_vat, 2), 'FM999999999990.##') AS "Выручка сотрудника без НДС",

    fc.formula_text                                                     AS "Формула"
FROM final_calc fc
JOIN tbl_employee emp
    ON emp.id = fc.employee_id
LEFT JOIN tbl_ou ou_emp
    ON ou_emp.id = emp.ou
LEFT JOIN tbl_block bl
    ON bl.id = emp.block
LEFT JOIN tbl_servicecall sc
    ON sc.id = fc.id_call
LEFT JOIN tbl_employee emp_requester
    ON emp_requester.id = sc.initiator
LEFT JOIN tbl_ou ou_requester
    ON ou_requester.id = emp_requester.ou
WHERE COALESCE(emp.sotrnapr, 0) <> 34213707
ORDER BY
    fc.call_title,
    fc.group_task_key,
    emp.title;
