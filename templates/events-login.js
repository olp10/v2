export function template(name = '', password = '') {
  return `
  <form method="post" action="/post">
    <label>
      Nafn:
      <input required type="text" name="name" value="${name}">
    </label>
    <label>
      Lykilorð:
      <input required type="password" name="password" value="${password}">
    </label>
    <button>Senda</button>
  `
}
