document.addEventListener("DOMContentLoaded", loadPosts);

// 🔹 GET USER
async function getUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}

// 🔹 CREATE POST
async function createPost() {
    const user = await getUser();

    if (!user) return alert("Login required");

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();

    if (!title || !content) return alert("Fill all fields");

    const { error } = await supabaseClient
        .from("community_posts")
        .insert([{ title, content, user_id: user.id }]);

    if (error) {
        console.error(error);
        return alert(error.message);
    }

    document.getElementById("title").value = "";
    document.getElementById("content").value = "";

    loadPosts();
}

// 🔹 LOAD POSTS
async function loadPosts() {
    const user = await getUser();

    const { data: posts } = await supabaseClient
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });

    const container = document.getElementById("posts");
    container.innerHTML = "";

    for (const post of posts) {

        if (!post.id) continue;

        // PROFILE
        const { data: profile } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", post.user_id)
            .maybeSingle();

        // LIKE COUNT
        const { count } = await supabaseClient
            .from("likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);

        // CHECK IF USER LIKED
        let liked = false;
        if (user) {
            const { data } = await supabaseClient
                .from("likes")
                .select("*")
                .eq("post_id", post.id)
                .eq("user_id", user.id);

            liked = data.length > 0;
        }

        const isOwner = user && user.id === post.user_id;

        container.innerHTML += `
            <div class="card">

                <div style="display:flex;align-items:center;gap:10px;">
                    <img src="${profile?.avatar_url || ''}" 
                         style="width:35px;height:35px;border-radius:50%;">
                    <strong>${profile?.username || "User"}</strong>
                </div>

                <h3>${post.title}</h3>
                <p>${post.content}</p>

                <button onclick="toggleLike(${post.id})"
                    style="color:${liked ? 'red' : 'black'}">
                    ❤️ ${count || 0}
                </button>

                ${
                    isOwner
                    ? `
                        <button onclick="editPost(${post.id})">Edit</button>
                        <button onclick="deletePost(${post.id})">Delete</button>
                      `
                    : ""
                }

                <div>
                    <input id="comment-${post.id}" placeholder="Comment">
                    <button onclick="addComment(${post.id})">Send</button>
                </div>

                <div id="comments-${post.id}"></div>

            </div>
        `;

        loadComments(post.id);
    }
}

// 🔹 TOGGLE LIKE (NO FLICKER)
async function toggleLike(postId) {
    if (!postId) return;

    const user = await getUser();
    if (!user) return alert("Login required");

    const { data } = await supabaseClient
        .from("likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id);

    if (data.length > 0) {
        await supabaseClient
            .from("likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", user.id);
    } else {
        await supabaseClient
            .from("likes")
            .insert([{ post_id: postId, user_id: user.id }]);
    }

    loadPosts();
}

// 🔹 EDIT
async function editPost(id) {
    if (!id) return;

    const title = prompt("New title");
    const content = prompt("New content");

    if (!title || !content) return;

    await supabaseClient
        .from("community_posts")
        .update({ title, content })
        .eq("id", id);

    loadPosts();
}

// 🔹 DELETE
async function deletePost(id) {
    if (!id) return;
    if (!confirm("Delete post?")) return;

    await supabaseClient
        .from("community_posts")
        .delete()
        .eq("id", id);

    loadPosts();
}

// 🔹 ADD COMMENT
async function addComment(postId) {
    if (!postId) return;

    const user = await getUser();
    if (!user) return alert("Login required");

    const input = document.getElementById(`comment-${postId}`);
    const content = input.value;

    if (!content) return;

    await supabaseClient
        .from("comments")
        .insert([{ post_id: postId, content, user_id: user.id }]);

    input.value = "";

    loadComments(postId);
}

// 🔹 LOAD COMMENTS
async function loadComments(postId) {
    if (!postId) return;

    const { data } = await supabaseClient
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at");

    const container = document.getElementById(`comments-${postId}`);
    if (!container) return;

    container.innerHTML = "";

    data.forEach(c => {
        container.innerHTML += `<p>💬 ${c.content}</p>`;
    });
}