const page = document.getElementById("page");
const mainPageHTML = page.innerHTML;

const API_URL = localStorage.getItem("API_URL") || "http://127.0.0.1:5000";

// Show if has connection to main server
if (navigator.onLine) {
    // Do something about it

}

requestMainPageData();

function requestMainPageData() {

    // Request from the server
    fetch(new Request(`${API_URL}/documents`)).then(r => r.json())
        .then(data => {
            const { documents } = data;

            const homeworks = document.getElementById("homeworks");

            if (documents.length > 0) {
                homeworks.innerHTML = documents.map((doc, index) => {
                    const [id, name] = doc.split('$%');
                    return `<p index=${id} onclick="openDocument(this)">${name}</p>`
                }).join('');
            }
        })
        .catch(err => {
            homeworks.innerHTML = '<p class="nothing">Não encontramos nada :(</p>';
            console.error(err)
        });

    // Show all titles from localStorage
    const myLocalHomeworks = document.getElementById("my-homeworks");
    const inventory = getDocumentsFromLocalStorage()
    if (inventory.length > 0)
        myLocalHomeworks.innerHTML = inventory.map((doc, index) => {
            const [_, id, title] = doc.eid.split('$%');
            return `<p index=${id} onclick="openDocument(this)">${title}</p>`
        }).join('');
}

function getDocumentsFromLocalStorage() {
    return Object.keys(localStorage).reduce((filtered, key) => {
        const [_, id, title] = key.split('$%');
        if (document !== undefined && id !== undefined && title !== undefined)
            filtered.push({ eid: `document$%${id}$%${title}` });
        return filtered;
    }, []);
}

// If user clicks on a document, open it
let currentOpenedDocument = "";

function openDocument(element) {
    const title = element.innerHTML;
    const id = element.getAttribute("index");

    const localDocument = localStorage.getItem(`document$%${id}$%${title}`);

    // Existe no banco de dados local
    if (localDocument) {
        currentOpenedDocument = localDocument;
        renderDocument(id, title);
    }
    // Não existe no banco de dados local
    else {
        const request = new Request(`${API_URL}/documents/${id}`, { method: 'GET' });
        fetch(request)
            .then(response => response.text())
            .then(data => {
                currentOpenedDocument = data;
                renderDocument(id, title);
            })
            .catch(err => console.error(err));
    }
}

function addDocumentBackpack(id, title) {
    localStorage.setItem(`document$%${id}$%${title}`, currentOpenedDocument)
    renderDocument(id, title);
}

function removeDocumentBackpack(id, title) {
    const localDocument = localStorage.getItem(`document$%${id}$%${title}`);
    if (!localDocument)
        return;

    localStorage.removeItem(`document$%${id}$%${title}`);
    main();
}

function renderDocument(id, title) {
    function render(data, hasAdded) {
        currentOpenedDocument = data;
        page.innerHTML = `
            <div id="text"> ${data} </div>
            <div class="btn-bottom">
                <button class="red" onclick="main()">Voltar</button>
                ${hasAdded ?
                    `<button class="red" onclick="removeDocumentBackpack('${id}', '${title}')">Remover</button>` :
                    `<button class="green" onclick="addDocumentBackpack('${id}', '${title}')">Adicionar</button>`
                }
            </div>
            `;
    }

    const localDocument = localStorage.getItem(`document$%${id}$%${title}`);

    if (!localDocument) {
        // Pegar da web
        const request = new Request(`${API_URL}/documents/${id}`, { method: 'GET' });
        fetch(request)
            .then(response => response.text())
            .then(data => {
                render(data, false);
            })
            .catch(err => console.error(err));
    } else {
        render(localDocument, true);
    }
}

function openConfiguration() {
    page.innerHTML = `
            <label for="server-url">Endereço do Servidor</label>
            <input type="text" id="server-url">
            <div class="btn-bottom">
                <button class="green" onclick="updateConfig()">Atualizar dados</button>
                <button class="red" onclick="main()">Voltar</button>
            </div>`;
    document.getElementById('server-url').value = localStorage.getItem("API_URL") || "http://127.0.0.1:5000";
}

function updateConfig() {
    localStorage.setItem("API_URL", document.getElementById('server-url').value);
    location.reload();
}

function main() {
    page.innerHTML = mainPageHTML;
    requestMainPageData();
}