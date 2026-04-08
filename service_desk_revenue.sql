-- ============================================================================
-- Расчет выручки сотрудников по закрытым заявкам Service Desk (PostgreSQL)
-- Версия 2: адаптирована к фактическим именам полей из рабочей схемы
-- (servicecall_id, codeofclosing_id, servicecall, tsktype, parent_id и т.д.).
-- ============================================================================

WITH
params AS (
    SELECT
        CAST(NULL AS timestamp) AS p_date_from,
        CAST(NULL AS timestamp) AS p_date_to,
        CAST(NULL AS text)      AS p_sc_title,
        CAST(NULL AS text)      AS p_sc_number
),

-- Базовый набор заявок + услуга + статус/код закрытия.
base_calls AS (
    SELECT
        sc.id,
        sc.title,
        sc.number_,
        sc.stateStartTime,
        sc.case_id,
        sc.state,
        sc.clientemployee_id,
        sc.solvedbyemployee_id,
        sc.initiator,
        sc.responsibleemployee_id,
        sc."isaccesscall$empnum",
        sc."organizcall$empnum",
        sc."accesscall$empnum",

        codeOfClosing.code                                              AS closing_code,

        -- ВАЖНО: tbl_servicec$accessca_providea связываем по servicecall_id.
        scd.servicecall_id,

        ts_sc.id                                                        AS service_id,
        ts_sc.title                                                     AS service_title,
        ts_sc.inventory_Number                                          AS service_code,
        ts_sc.calculateCost                                             AS service_formula_id
    FROM tbl_servicecall sc
    LEFT JOIN tbl_servicec$accessca_providea scd
        ON sc.id = scd.servicecall_id
    LEFT JOIN tbl_slmservice ts_sc
        ON ts_sc.id = sc.service_id
    LEFT JOIN tbl_closurecode codeOfClosing
        ON codeOfClosing.id = sc.codeofclosing_id
),

-- Фильтр закрытых заявок по бизнес-правилам.
filtered_calls AS (
    SELECT bc.*
    FROM base_calls bc
    JOIN tbl_sys_metainfo_states tsms
      ON tsms.clazz = 'serviceCall'
     AND tsms.kase  = bc.case_id
     AND tsms.code  = bc.state
    LEFT JOIN tbl_employee emp_s
      ON emp_s.id = bc.solvedbyemployee_id
    CROSS JOIN params p
    WHERE tsms.code = 'closed'
      AND (
            (bc.service_title <> 'Инициализация проекта' AND bc.closing_code = 'resolved')
            OR
            (bc.service_title  = 'Инициализация проекта' AND bc.closing_code = 'rejected')
          )
      AND (emp_s.sotrnapr <> 34213707 OR emp_s.sotrnapr IS NULL)
      AND (p.p_date_from IS NULL OR bc.stateStartTime >= p.p_date_from)
      AND (p.p_date_to   IS NULL OR bc.stateStartTime <= p.p_date_to)
      AND (p.p_sc_title  IS NULL OR bc.title = p.p_sc_title)
      AND (p.p_sc_number IS NULL OR bc.number_::text = p.p_sc_number)
),

-- TASK: tbl_task + tbl_workrecord (wr.task = task.id)
source_task AS (
    SELECT
        fc.id                                                           AS id_call,
        fc.title                                                        AS sc_title,
        fc.number_                                                      AS sc_number,
        fc.service_id,
        fc.service_title,
        fc.service_code,

        wr.employee                                                     AS employee_id,
        COALESCE(task.title, 'AUTO_TASK_' || task.id::text)            AS nomer,
        COALESCE(tt2.title, 'TASK_WITHOUT_TASKTYPE')                    AS task_type_title,

        COALESCE(wr.time, 0::numeric)                                   AS time,
        COALESCE(task.taskcost, tt2."tasktype$price", 0::numeric)      AS tt_price,

        COALESCE(f_task.title, f_service.title)                         AS formula,
        'TASK'::text                                                    AS source_kind,

        1::numeric                                                      AS call_coefficient,
        0::int                                                          AS has_coefficient
    FROM filtered_calls fc
    JOIN tbl_task task
      ON task.servicecall = fc.id
    JOIN tbl_workrecord wr
      ON wr.task = task.id
    LEFT JOIN tbl_tasktype tt2
      ON tt2.id = task.tsktype
    LEFT JOIN tbl_formula f_task
      ON f_task.id = tt2.calculateCost
    LEFT JOIN tbl_formula f_service
      ON f_service.id = fc.service_formula_id
    WHERE COALESCE(wr.time, 0) > 0
),

-- SERVICE: wr.task IS NULL (строки услуг)
source_service AS (
    SELECT
        fc.id                                                           AS id_call,
        fc.title                                                        AS sc_title,
        fc.number_                                                      AS sc_number,
        fc.service_id,
        fc.service_title,
        fc.service_code,

        wr.employee                                                     AS employee_id,
        fc.title                                                        AS nomer,
        COALESCE(tt2.title, 'SERVICE_WITHOUT_TASKTYPE')                AS task_type_title,

        COALESCE(wr.time, 0::numeric)                                   AS time,
        COALESCE(tt2."tasktype$price", 0::numeric)                    AS tt_price,

        COALESCE(f_task.title, f_service.title)                         AS formula,
        'SERVICE'::text                                                 AS source_kind,

        COALESCE(fc."isaccesscall$empnum", fc."organizcall$empnum", fc."accesscall$empnum", 1::numeric)
                                                                      AS call_coefficient,
        CASE
            WHEN COALESCE(fc."isaccesscall$empnum", fc."organizcall$empnum", fc."accesscall$empnum", 1::numeric) <> 1::numeric
                 THEN 1 ELSE 0
        END                                                             AS has_coefficient
    FROM filtered_calls fc
    JOIN tbl_workrecord wr
      ON wr.servicecall = fc.id
     AND wr.task IS NULL
    LEFT JOIN tbl_tasktype tt2
      ON tt2.id = wr.tasktype
    LEFT JOIN tbl_tasktype$tasktype_relateds tttr
      ON tttr.tasktype_id = tt2.id
     AND tttr.relatedservice_id = fc.service_id
    LEFT JOIN tbl_formula f_task
      ON f_task.id = tt2.calculateCost
    LEFT JOIN tbl_formula f_service
      ON f_service.id = fc.service_formula_id
    WHERE COALESCE(wr.time, 0) > 0
),

source_data AS (
    SELECT * FROM source_task
    UNION ALL
    SELECT * FROM source_service
),

raw_data AS (
    SELECT
        a.id_call,
        a.sc_title,
        a.sc_number,
        a.service_title,
        a.service_code,
        a.employee_id,
        a.formula,
        a.source_kind,
        a.has_coefficient,
        a.call_coefficient,

        CASE
            WHEN a.source_kind = 'SERVICE'
             AND a.service_title = 'Организация нового рабочего места'
             AND a.task_type_title IN (
                'Настройка АРМ', 'Подключение КМТ к АРМ', 'Установка АРМ',
                'Установка базового программного обеспечения',
                'Установка\настройка телефонного аппарата',
                'Установка пользовательской операционной системы'
             ) THEN 1
            WHEN a.source_kind = 'SERVICE'
             AND a.service_title = 'Сопровождение переезда'
             AND a.task_type_title IN (
                'Отключение АРМ\КМТ для перемещения пределах одного здания',
                'Установка АРМ\КМТ после перемещения в пределах одного здания'
             ) THEN 1
            ELSE 0
        END AS is_package_task,

        CASE
            WHEN a.source_kind = 'SERVICE'
             AND a.service_title = 'Организация нового рабочего места'
             AND a.task_type_title IN (
                'Настройка АРМ', 'Подключение КМТ к АРМ', 'Установка АРМ',
                'Установка базового программного обеспечения',
                'Установка\настройка телефонного аппарата',
                'Установка пользовательской операционной системы'
             ) THEN '__PACKAGE__'
            WHEN a.source_kind = 'SERVICE'
             AND a.service_title = 'Сопровождение переезда'
             AND a.task_type_title IN (
                'Отключение АРМ\КМТ для перемещения пределах одного здания',
                'Установка АРМ\КМТ после перемещения в пределах одного здания'
             ) THEN '__PACKAGE__'
            ELSE a.nomer
        END AS group_task_key,

        STRING_AGG(DISTINCT a.task_type_title, ', ' ORDER BY a.task_type_title) AS task_name,
        STRING_AGG(DISTINCT a.nomer, ', ' ORDER BY a.nomer)                      AS task_number,

        -- База без коэффициента (важно).
        SUM(a.tt_price)                                                           AS amount_wo_vat,

        -- TimeCostSotrNum: коэффициент только для SERVICE.
        SUM(
            (CASE WHEN a.formula = 'B' THEN a.tt_price * a.time ELSE a.tt_price END)
            * CASE WHEN a.source_kind = 'SERVICE' THEN a.call_coefficient ELSE 1::numeric END
        )                                                                         AS amount_labor_wo_vat,

        ROUND(SUM(
            CASE
                WHEN a.source_kind = 'SERVICE'
                 AND a.service_title = 'Организация нового рабочего места'
                 AND a.task_type_title IN (
                    'Настройка АРМ', 'Подключение КМТ к АРМ', 'Установка АРМ',
                    'Установка базового программного обеспечения',
                    'Установка\настройка телефонного аппарата',
                    'Установка пользовательской операционной системы'
                 ) THEN a.time / 6.0
                WHEN a.source_kind = 'SERVICE'
                 AND a.service_title = 'Сопровождение переезда'
                 AND a.task_type_title IN (
                    'Отключение АРМ\КМТ для перемещения пределах одного здания',
                    'Установка АРМ\КМТ после перемещения в пределах одного здания'
                 ) THEN a.time / 2.0
                ELSE a.time
            END
        )::numeric, 2)                                                            AS raw_hours
    FROM source_data a
    WHERE COALESCE(a.formula, '') <> 'Z'
    GROUP BY
        a.id_call, a.sc_title, a.sc_number, a.service_title, a.service_code,
        a.employee_id, a.formula, a.source_kind, a.has_coefficient, a.call_coefficient,
        CASE
            WHEN a.source_kind = 'SERVICE'
             AND a.service_title = 'Организация нового рабочего места'
             AND a.task_type_title IN (
                'Настройка АРМ', 'Подключение КМТ к АРМ', 'Установка АРМ',
                'Установка базового программного обеспечения',
                'Установка\настройка телефонного аппарата',
                'Установка пользовательской операционной системы'
             ) THEN 1
            WHEN a.source_kind = 'SERVICE'
             AND a.service_title = 'Сопровождение переезда'
             AND a.task_type_title IN (
                'Отключение АРМ\КМТ для перемещения пределах одного здания',
                'Установка АРМ\КМТ после перемещения в пределах одного здания'
             ) THEN 1
            ELSE 0
        END,
        CASE
            WHEN a.source_kind = 'SERVICE'
             AND a.service_title = 'Организация нового рабочего места'
             AND a.task_type_title IN (
                'Настройка АРМ', 'Подключение КМТ к АРМ', 'Установка АРМ',
                'Установка базового программного обеспечения',
                'Установка\настройка телефонного аппарата',
                'Установка пользовательской операционной системы'
             ) THEN '__PACKAGE__'
            WHEN a.source_kind = 'SERVICE'
             AND a.service_title = 'Сопровождение переезда'
             AND a.task_type_title IN (
                'Отключение АРМ\КМТ для перемещения пределах одного здания',
                'Установка АРМ\КМТ после перемещения в пределах одного здания'
             ) THEN '__PACKAGE__'
            ELSE a.nomer
        END
    HAVING ROUND(SUM(
            CASE
                WHEN a.source_kind = 'SERVICE'
                 AND a.service_title = 'Организация нового рабочего места'
                 AND a.task_type_title IN (
                    'Настройка АРМ', 'Подключение КМТ к АРМ', 'Установка АРМ',
                    'Установка базового программного обеспечения',
                    'Установка\настройка телефонного аппарата',
                    'Установка пользовательской операционной системы'
                 ) THEN a.time / 6.0
                WHEN a.source_kind = 'SERVICE'
                 AND a.service_title = 'Сопровождение переезда'
                 AND a.task_type_title IN (
                    'Отключение АРМ\КМТ для перемещения пределах одного здания',
                    'Установка АРМ\КМТ после перемещения в пределах одного здания'
                 ) THEN a.time / 2.0
                ELSE a.time
            END
        )::numeric, 2) > 0
),

group_employee_cnt AS (
    SELECT id_call, group_task_key, COUNT(DISTINCT employee_id) AS employee_cnt
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
            WHEN c.formula = 'B' THEN c.amount_labor_wo_vat
            WHEN c.has_coefficient = 1 AND c.employee_cnt = 1 THEN c.amount_labor_wo_vat
            WHEN c.has_coefficient = 1 AND c.employee_cnt > 1 THEN
                CASE WHEN c.total_group_hours = 0 THEN 0
                     ELSE (c.amount_labor_wo_vat * c.spent_hours) / c.total_group_hours END
            ELSE
                CASE WHEN c.total_group_hours = 0 THEN 0
                     ELSE (c.amount_wo_vat * c.spent_hours) / c.total_group_hours END
        END AS employee_revenue_wo_vat,

        CASE
            WHEN c.formula = 'B'
                THEN 'FORMULA=B => Выручка = Сумма с трудозатратами без НДС'
            WHEN c.has_coefficient = 1 AND c.employee_cnt = 1
                THEN 'Коэфф. заявка, 1 сотрудник => Выручка = Сумма с трудозатратами без НДС'
            WHEN c.has_coefficient = 1 AND c.employee_cnt > 1
                THEN '(Сумма с трудозатратами без НДС * Затраченное время) / Количество часов отраженные всего'
            ELSE '(Сумма без НДС * Затраченное время) / Количество часов отраженные всего'
        END AS formula_text
    FROM calc_data c
)

SELECT
    COALESCE(org_client.title, 'Не указана')                                AS "Организация заявителя",
    COALESCE(bl_emp.title, bl_resp.title, 'Заявка закрыта смежными отделами') AS "Блок сотрудника",
    COALESCE(ou_emp.title, ou_resp.title)                                   AS "Отдел сотрудника",
    COALESCE(emp.title, emp_resp.title)                                     AS "ФИО сотрудника",

    fc.task_name                                                            AS "Наименование задачи",
    fc.service_code                                                         AS "Код услуги",
    fc.sc_title                                                             AS "Номер заявки",
    fc.task_number                                                          AS "Номер задачи",

    to_char(ROUND(fc.amount_wo_vat, 2), 'FM999999999990.##')               AS "Сумма без НДС",
    to_char(ROUND(fc.amount_labor_wo_vat, 2), 'FM999999999990.##')         AS "Сумма с трудозатратами без НДС",
    to_char(ROUND(fc.spent_hours, 2), 'FM999999999990.##')                 AS "Затраченное время",
    to_char(ROUND(fc.total_group_hours, 2), 'FM999999999990.##')           AS "Количество часов отраженные всего",
    to_char(ROUND(fc.employee_revenue_wo_vat, 2), 'FM999999999990.##')     AS "Выручка сотрудника без НДС",

    fc.formula_text                                                         AS "Формула"
FROM final_calc fc
LEFT JOIN tbl_employee emp
  ON emp.id = fc.employee_id
LEFT JOIN tbl_ou ou_emp
  ON ou_emp.id = emp.parent_id
LEFT JOIN tbl_block bl_emp
  ON bl_emp.id = emp.sotrnapr
LEFT JOIN tbl_servicecall sc
  ON sc.id = fc.id_call
LEFT JOIN tbl_employee emp_resp
  ON emp_resp.id = sc.responsibleemployee_id
LEFT JOIN tbl_ou ou_resp
  ON ou_resp.id = emp_resp.parent_id
LEFT JOIN tbl_block bl_resp
  ON bl_resp.id = emp_resp.sotrnapr
LEFT JOIN tbl_employee emp_client
  ON emp_client.id = sc.clientemployee_id
LEFT JOIN tbl_ou org_client
  ON org_client.id = emp_client.organization
ORDER BY fc.sc_title, fc.group_task_key, COALESCE(emp.title, emp_resp.title);
