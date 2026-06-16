// Якорь карточки задания. Точки в id нельзя использовать в id/href напрямую (CSS-селектор),
// поэтому "1.5" -> "task-1-5".
export function taskAnchor(id: string): string {
  return 'task-' + id.replace(/\./g, '-')
}
