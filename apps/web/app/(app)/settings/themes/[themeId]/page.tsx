import { ThemeBuilderPage } from "@/modules/theme"

export default async function ThemeDetailPage(
  props: { params: Promise<{ themeId: string }> }
) {
  const { themeId } = await props.params

  return <ThemeBuilderPage mode="edit" themeId={themeId} />
}
