document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("postBtn").addEventListener("click", createPost);
    loadPosts();
});

// CREATE POST
async function createPost() {
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    if (!title || !content) {
        errorMsg.textContent = "Fill all fields";
        return;
    }

    errorMsg.textContent = "";

    const { error } = await supabaseClient
        .from("community_posts")
        .insert([{ title, content }]);

    if (error) {
        console.error("Insert error:", error);
        errorMsg.textContent = "Error creating post";
        return;
    }

    document.getElementById("title").value = "";
    document.getElementById("content").value = "";

    loadPosts();
}

// LOAD POSTS
async function loadPosts() {
    const { data, error } = await supabaseClient
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Fetch error:", error);
        return;
    }

    const postsContainer = document.getElementById("posts");
    postsContainer.innerHTML = "";

    data.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post-card");

        const titleEl = document.createElement("h3");
        titleEl.textContent = post.title;

        const contentEl = document.createElement("p");
        contentEl.textContent = post.content;

        const timeEl = document.createElement("small");
        timeEl.textContent = new Date(post.created_at).toLocaleString();

        // DELETE BUTTON
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑 Delete";
        deleteBtn.onclick = () => deletePost(post.id);

        // EDIT BUTTON
        const editBtn = document.createElement("button");
        editBtn.textContent = "✏ Edit";
        editBtn.onclick = () => editPost(post.id, post.title, post.content);

        // Append elements
        postDiv.appendChild(titleEl);
        postDiv.appendChild(contentEl);
        postDiv.appendChild(timeEl);
        postDiv.appendChild(document.createElement("br"));
        postDiv.appendChild(document.createElement("br"));
        postDiv.appendChild(deleteBtn);
        postDiv.appendChild(editBtn);

        postsContainer.appendChild(postDiv);
    });
}

// DELETE POST
async function deletePost(id) {
    const confirmDelete = confirm("Delete this post?");
    if (!confirmDelete) return;

    console.log("Deleting:", id);

    const { error } = await supabaseClient
        .from("community_posts")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Delete error:", error);
        return;
    }

    loadPosts();
}

// EDIT POST
function editPost(id, oldTitle, oldContent) {
    const newTitle = prompt("Edit title:", oldTitle);
    const newContent = prompt("Edit content:", oldContent);

    if (!newTitle || !newContent) return;

    updatePost(id, newTitle, newContent);
}

// UPDATE POST
async function updatePost(id, title, content) {
    console.log("Updating:", id, title, content);

    const { error } = await supabaseClient
        .from("community_posts")
        .update({ title, content })
        .eq("id", id);

    if (error) {
        console.error("Update error:", error);
        return;
    }

    loadPosts();
}