import type { ActionFunctionArgs } from "react-router";
import { z, ZodAny, ZodObject, ZodType } from "zod";

export async function validateFormData<A extends ActionFunctionArgs, S extends ZodType>(
  args: A,
  schema: S
) {
  const formData = await args.request.formData();
  const obj = Object.fromEntries(formData.entries());
  const res = schema.safeParse(obj);
  if (!res.success) {
    return { success: false, error: z.flattenError(res.error) } as const;
  }
  return { success: true, data: res.data } as const;
}
