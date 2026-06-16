// Ставит data-theme ДО первой отрисовки, чтобы не было вспышки тёмной темы.
// Светлая тема — по умолчанию (приоритет проекта). Логика повторяет _legacy/js/navigation.js.
const code = `(function(){try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){t='light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}
