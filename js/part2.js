const userList = document.getElementById("user-list");

document.addEventListener("DOMContentLoaded", async () => {
    // This function should GET the first page of users from reqres.in.
    // The users should be displayed in the user-list element.
    // Each user should be in a new <div> with the user's first name, last name, and profile image.
    // The format should follow the example user in the HTML file.

    // Send GET request
    const response = await fetch("https://reqres.in/api/users");
    const data = await response.json();

    data.data.forEach(user => {
        const card = document.createElement("div");
        card.className = "card";
        const name = document.createElement("h2");
        name.textContent = `${user.first_name} ${user.last_name}`;
        const img = document.createElement("img");
        img.src = user.avatar;
        img.alt = `${user.first_name} ${user.last_name}`;
        card.appendChild(name);
        card.appendChild(img);
        userList.appendChild(card);
    });
});
