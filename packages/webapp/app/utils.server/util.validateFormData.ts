import type { ActionFunctionArgs } from "react-router";
import { z, ZodObject } from "zod";

export async function validateFormData<A extends ActionFunctionArgs, S extends ZodObject>(
  args: A,
  schema: S
) {
  const formData = await args.request.formData();
  const obj = Object.fromEntries(formData.entries());
  const res = schema.safeParse(obj);
  if (!res.success) {
    return { success: false, error: z.flattenError(res.error) };
  }
  return { success: true, data: res.data as z.core.output<S> };
}
