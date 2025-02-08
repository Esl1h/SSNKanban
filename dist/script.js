document.addEventListener("DOMContentLoaded", () => {
    const columns = document.querySelectorAll(".column");

    function saveBoardState() {
        const boardState = {};
        columns.forEach(column => {
            boardState[column.id] = Array.from(column.children)
                .filter(card => card.classList.contains("card"))
                .map(card => card.innerText);
        });

        const message = {
            action: "set-data",
            data: JSON.stringify(boardState)
        };
        window.parent.postMessage(message, "*");
    }

    function loadBoardState(savedState) {
        if (!savedState) return;
        const boardState = JSON.parse(savedState);
        columns.forEach(column => {
            column.innerHTML = `<h2>${column.id.replace("-", " ")}</h2>`;
            if (boardState[column.id]) {
                boardState[column.id].forEach(task => {
                    const card = createCard(task);
                    column.appendChild(card);
                });
            }
        });
        addDragAndDropEvents();
    }

    function createCard(text) {
        const card = document.createElement("div");
        card.classList.add("card");
        card.draggable = true;
        card.innerText = text;
        return card;
    }

    function addDragAndDropEvents() {
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("dragstart", () => card.classList.add("dragging"));
            card.addEventListener("dragend", () => {
                card.classList.remove("dragging");
                saveBoardState();
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

    window.addEventListener("message", (event) => {
        if (event.data && event.data.action === "get-data") {
            loadBoardState(event.data.data);
        }
    });

    window.parent.postMessage({ action: "request-data" }, "*");
});
