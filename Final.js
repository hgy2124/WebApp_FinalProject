document.querySelectorAll('.sidebar button').forEach(button => {
    button.addEventListener('click', () => {
        alert("Button clicked: " + button.textContent.trim());
    });
});
