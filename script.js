let postsContainer = document.querySelector(".posts");
let newPostForm = document.getElementById("new-post-form");
let postTitleInput = document.getElementById("post-title");
let postContentInput = document.getElementById("post-content");

if (!localStorage.getItem("blogPosts")) {
  localStorage.setItem("blogPosts", JSON.stringify([]));
}

document.addEventListener("DOMContentLoaded", function () {
  let currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "index.html" || currentPage === "") {
    loadBlogPosts();
  } else if (currentPage === "post.html") {
    loadSinglePost();
  } else if (currentPage === "new-post.html") {
    setupNewPostForm();
    setupImageHandling("post-image", "paste-area", "image-preview");
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

    let contentPreview =
      post.content.length > 150
        ? post.content.substring(0, 150) + "..."
        : post.content;

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

function loadSinglePost() {
  let urlParams = new URLSearchParams(window.location.search);
  let postId = urlParams.get("id");

  if (!postId) {
    window.location.href = "index.html";
    return;
  }

  let posts = JSON.parse(localStorage.getItem("blogPosts"));
  let post = posts.find((p) => p.id === postId);

  if (!post) {
    alert("Post not found!");
    window.location.href = "index.html";
    return;
  }

  document.title = post.title + " - My Blog";

  document.getElementById("post-title").textContent = post.title;
  document.getElementById("post-date").textContent = new Date(
    post.date
  ).toLocaleDateString();
  document.getElementById("post-content").textContent = post.content;

  let postImageContainer = document.getElementById("post-image");
  if (post.image) {
    postImageContainer.innerHTML = `<img src="${post.image}" alt="${post.title}" class="post-image">`;
  } else {
    postImageContainer.style.display = "none";
  }

  document.getElementById("edit-button").addEventListener("click", function () {
    showEditForm(post);
  });

  document
    .getElementById("delete-button")
    .addEventListener("click", function () {
      if (confirm("Are you sure you want to delete this post?")) {
        deletePost(postId);
      }
    });

  document.getElementById("edit-post").style.display = "none";
}

function showEditForm(post) {
  document.getElementById("view-post").style.display = "none";
  document.getElementById("edit-post").style.display = "block";

  document.getElementById("edit-title").value = post.title;
  document.getElementById("edit-content").value = post.content;

  if (post.image) {
    currentImage = post.image;
    displayImagePreview(
      post.image,
      document.getElementById("edit-image-preview")
    );
  }

  setupImageHandling("edit-image", "edit-paste-area", "edit-image-preview");

  let editForm = document.getElementById("edit-post-form");
  editForm.onsubmit = function (x) {
    x.preventDefault();
    saveEditedPost(post.id);
  };

  document.getElementById("cancel-edit").addEventListener("click", function () {
    document.getElementById("edit-post").style.display = "none";
    document.getElementById("view-post").style.display = "block";
  });
}

function saveEditedPost(postId) {
  const editTitle = document.getElementById("edit-title").value.trim();
  const editContent = document.getElementById("edit-content").value.trim();

  if (!editTitle || !editContent) {
    alert("Please fill out the title and content sections.");
    return;
  }

  let posts = JSON.parse(localStorage.getItem("blogPosts"));
  let postIndex = posts.findIndex((p) => p.id === postId);

  if (postIndex === -1) {
    alert("Error updating post.");
    return;
  }

  posts[postIndex].title = editTitle;
  posts[postIndex].content = editContent;

  if (currentImage !== posts[postIndex].image) {
    posts[postIndex].image = currentImage;
  }

  localStorage.setItem("blogPosts", JSON.stringify(posts));

  alert("Post updated successfully!");

  window.location.reload();
}

function deletePost(postId) {
  let posts = JSON.parse(localStorage.getItem("blogPosts"));
  posts = posts.filter((post) => post.id !== postId);
  localStorage.setItem("blogPosts", JSON.stringify(posts));
  alert("Post deleted successfully!");
  window.location.href = "index.html";
}

let currentImage = null;

function setupNewPostForm() {
  if (newPostForm) {
    newPostForm.addEventListener("submit", function (x) {
      x.preventDefault();
      let title = postTitleInput.value.trim();
      let content = postContentInput.value.trim();

      if (!title || !content) {
        alert("Please fill out the title and content fields.");
        return;
      }

      let newPost = {
        id: Date.now().toString(),
        title: title,
        content: content,
        image: currentImage,
        date: new Date().toISOString(),
      };

      let posts = JSON.parse(localStorage.getItem("blogPosts"));
      posts.push(newPost);
      localStorage.setItem("blogPosts", JSON.stringify(posts));

      alert("Post uploaded successfully!");
      window.location.href = "index.html";
    });
  }
}

function setupImageHandling(fileInputId, pasteAreaId, previewId) {
  let fileInput = document.getElementById(fileInputId);
  let pasteArea = document.getElementById(pasteAreaId);
  let imagePreview = document.getElementById(previewId);

  if (!fileInput || !pasteArea || !imagePreview) return;

  fileInput.addEventListener("change", function (x) {
    let file = x.target.files[0];
    if (file && file.type.startsWith("image/")) {
      let reader = new FileReader();
      reader.onload = function (event) {
        currentImage = event.target.result;
        displayImagePreview(currentImage, imagePreview);
      };
      reader.readAsDataURL(file);
    }
  });

  pasteArea.addEventListener("paste", function (x) {
    x.preventDefault();

    if (x.clipboardData && x.clipboardData.items) {
      let items = x.clipboardData.items;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          let blob = items[i].getAsFile();
          let reader = new FileReader();

          reader.onload = function (event) {
            currentImage = event.target.result;
            displayImagePreview(currentImage, imagePreview);
          };

          reader.readAsDataURL(blob);
          break;
        }
      }
    }
  });

  pasteArea.addEventListener("click", function () {
    fileInput.click();
  });
}

function displayImagePreview(imageData, previewElement) {
  previewElement.innerHTML = `<img src="${imageData}" alt="Image Preview">`;
}
