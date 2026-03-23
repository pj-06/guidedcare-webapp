document.addEventListener("DOMContentLoaded", () => {
    const postBtn = document.getElementById("postBtn");
    postBtn.addEventListener("click", createPost);
    loadPosts();
});

async function createPost() {
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    if (!title || !content) {
        errorMsg.textContent = "Title and content cannot be empty.";
        return;
    }

    errorMsg.textContent = "";

    const { error } = await supabaseClient
        .from("community_posts")
        .insert([{ title, content }]);

    if (error) {
        errorMsg.textContent = "Failed to create post.";
        console.error(error);
        return;
    }

    document.getElementById("title").value = "";
    document.getElementById("content").value = "";

    loadPosts();
}

async function loadPosts() {
    const { data, error } = await supabaseClient
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    const postsContainer = document.getElementById("posts");
    postsContainer.innerHTML = "";

    data.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post-card");

        postDiv.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <small>${new Date(post.created_at).toLocaleString()}</small>
        `;

        postsContainer.appendChild(postDiv);
    });
}