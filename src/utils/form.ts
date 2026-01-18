import { App } from "antd";
import { isNil } from "es-toolkit";
import { isObject, isArray } from "es-toolkit/compat";
import z from "zod";

export const toNullable = <T>(val: T): T => {
  // 1. 处理数组
  if (isArray(val)) {
    return val.map(toNullable) as unknown as T;
  }

  // 2. 处理对象 (排除 null 本身)
  if (isObject(val) && !isNil(val)) {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(val)) {
      // 递归处理每一个属性值
      result[key] = toNullable(value);
    }
    return result as T;
  }

  // 3. 核心转换逻辑：如果是空字符串或 undefined，返回 null
  if (val === "" || val === undefined) {
    return null as unknown as T;
  }

  // 4. 其他有效值（如 0, false, 正常字符串）原样返回
  return val;
};

export const useZodValidateData = <T>(values: unknown, schema: z.ZodSchema<T>) => {
  const processedValues = toNullable(values);

  const validatedResult = schema.safeParse(processedValues);
  if (!validatedResult.success) {
    const pretty = z.prettifyError(validatedResult.error);

    return {
      values: validatedResult.data,
      errors: validatedResult.error.issues,
      prettyErrors: pretty,
    };
  }
  return {
    values: validatedResult.data,
    errors: [] as z.core.$ZodIssue[],
    prettyErrors: "",
  };
};
