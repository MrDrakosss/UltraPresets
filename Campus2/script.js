document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("file-list");

  try {
    const res = await fetch("list.php");
    if (!res.ok) throw new Error("Nem sikerült betölteni a fájllistát");
    const files = await res.json();

    if (files.length === 0) {
      container.innerHTML = `<div class="alert alert-info">Nincs megjeleníthető fájl.</div>`;
      return;
    }

    for (const item of files) {
      const card = document.createElement("div");
      card.className = "card bg-white shadow-md p-4";

      let icon = item.type === "dir" ? "📁" : "📄";
      let link = item.type === "file" ? `<a href="${item.path}" download class="link link-primary">Letöltés</a>` : "";

      card.innerHTML = `
        <h2 class="text-lg font-semibold mb-2">${icon} ${item.path}</h2>
        ${link}
      `;

      container.appendChild(card);
    }
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
});
