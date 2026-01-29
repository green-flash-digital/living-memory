/**
 * Converts a string to snake_case.
 * Handles spaces, hyphens, and camelCase by converting to lowercase and separating with underscores.
 *
 * @example
 * toSnakeCase("The Smith Family") // "the_smith_family"
 * toSnakeCase("helloWorld") // "hello_world"
 * toSnakeCase("some-text") // "some_text"
 */
export function toSnakeCase(str: string): string {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2") // Insert underscore between lowercase and uppercase
    .replace(/[\s\-_]+/g, "_") // Replace spaces, hyphens, and existing underscores with single underscore
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "") // Remove any non-alphanumeric characters except underscores
    .replace(/_+/g, "_") // Replace multiple underscores with single underscore
    .replace(/^_|_$/g, ""); // Remove leading/trailing underscores
}

/**
 * Converts a string to kebab-case (slug format).
 * Handles spaces, underscores, and camelCase by converting to lowercase and separating with hyphens.
 * This is the format used for URL slugs.
 *
 * @example
 * toKebabCase("The Smith Family") // "the-smith-family"
 * toKebabCase("helloWorld") // "hello-world"
 * toKebabCase("some_text") // "some-text"
 */
export function toKebabCase(str: string): string {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Insert hyphen between lowercase and uppercase
    .replace(/[\s_\-]+/g, "-") // Replace spaces, underscores, and existing hyphens with single hyphen
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "") // Remove any non-alphanumeric characters except hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}
