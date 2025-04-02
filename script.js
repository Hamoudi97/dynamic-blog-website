let postsContainer = document.querySelector(".posts");

if (!localStorage.getItem("blogPosts")) {
  localStorage.setItem("blogPosts", JSON.stringify([]));
}

document.addEventListener("DOMContentLoaded", function () {
  let currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "index.html" || currentPage === "") {
    loadBlogPosts();
  }
});

function loadBlogPosts() {
  let posts = JSON.parse(localStorage.getItem("blogPosts"));
  postsContainer.innerHTML = "";
  if (posts.length === 0) {
    postsContainer.innerHTML =
      "<p>No blog posts yet. Create your first post!</p>";
    return;
  }

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  posts.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "post";
    let postHTML = `
            <h3>${post.title}</h3>
            <div class="post-date">${new Date(
              post.date
            ).toLocaleDateString()}</div>
        `;

    if (post.image) {
      postHTML += `<img src="${post.image}" alt="${post.title}" class="post-image">`;
    }

    postHTML += `
            <p>${contentPreview}</p>
            <a href="post.html?id=${post.id}" class="btn">View Post</a>
        `;

    postElement.innerHTML = postHTML;
    postsContainer.appendChild(postElement);
  });
}
