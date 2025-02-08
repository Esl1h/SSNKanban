document.addEventListener("DOMContentLoaded", () => {
    const columns = document.querySelectorAll(".column");

    // Função para salvar o estado do quadro no Standard Notes
    function saveBoardState() {
        const boardState = {};
        columns.forEach(column => {
            boardState[column.id] = Array.from(column.children)
                .filter(card => card.classList.contains("card")) // Evita capturar headers
                .map(card => card.innerText);
        });

        const message = {
            action: "save",
            content: JSON.stringify(boardState)
        };
        window.parent.postMessage(message, "*"); // Envia para o Standard Notes
    }

    // Função para carregar o estado salvo
    function loadBoardState(savedState) {
        if (!savedState) return;
        const boardState = JSON.parse(savedState);
        columns.forEach(column => {
            column.innerHTML = `<h2>${column.id.replace("-", " ")}</h2>`; // Mantém o título da coluna
            if (boardState[column.id]) {
                boardState[column.id].forEach(task => {
                    const card = createCard(task);
                    column.appendChild(card);
                });
            }
        });
        addDragAndDropEvents(); // Reaplica eventos de drag-and-drop
    }

    // Cria um novo card
    function createCard(text) {
        const card = document.createElement("div");
        card.classList.add("card");
        card.draggable = true;
        card.innerText = text;
        return card;
    }

    // Adiciona eventos de drag-and-drop aos cards
    function addDragAndDropEvents() {
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("dragstart", () => card.classList.add("dragging"));
            card.addEventListener("dragend", () => {
                card.classList.remove("dragging");
                saveBoardState(); // Salva após mover o card
            });
        });

        columns.forEach(column => {
            column.addEventListener("dragover", (event) => {
                event.preventDefault();
                const draggingCard = document.querySelector(".dragging");
                column.appendChild(draggingCard);
            });
        });
    }

    // Recebe dados salvos do Standard Notes
    window.addEventListener("message", (event) => {
        if (event.data && event.data.action === "load") {
            loadBoardState(event.data.content);
        }
    });

    // Solicita dados salvos ao abrir a extensão
    window.parent.postMessage({ action: "request-data" }, "*");
});
