document.addEventListener('DOMContentLoaded', () => {

    const currentUserId = $("#user").attr("data-user_id")
    const currentUserName = $("#user").attr("data-username")
    let start = 1; // page number   
    
    $("#follow").click( () => {
        const follows_id = $("#follow").attr("data-follow")       
        fetch("/api/follow", {
            method: "POST", 
            body: JSON.stringify({
                user_id: currentUserId, 
                follows_id: follows_id
            })
        })              
        .then(response => response.json())
        .then((result) => {
            $("#follow").toggle(600);
            $("#unfollow").toggle(600);
        })
    })

    $("#unfollow").click( () => {
        const follows_id = $("#unfollow").attr("data-unfollow")       
        fetch("/api/unfollow", {
            method: "POST", 
            body: JSON.stringify({user_id: currentUserId, follows_id: follows_id})
        })              
        .then(response => response.json())
        .then((result) => {
            $("#follow").toggle(600);
            $("#unfollow").toggle(600);
        })
    })

    $(".following").click( () => {
        const container = document.querySelector("#page-container")
        container.innerHTML = "";
        get_posts();
        return false
    })

    $("#new-post-btn").click(() => {
        newPostToggle()
    });

    $('#close-new-post').click(() => {
        newPostToggle()
    });

    $("#post-new-post").click(() => {
        content = document.querySelector("#new-post-text").value
        fetch('/api/post', {
            method: 'POST', 
            body: JSON.stringify({
            content: content
            })
        })
        newPostToggle()
    });

    const get_posts = function(page) {
        
        fetch(`/?page=${page}`)
        .then(response => response.json())
        .then((result) => {
            let i = 0;
            let post = null;
            while (post = result.posts[i]) {
                i++;
                let new_post = makePost(
                    post.id, 
                    post.username, 
                    post.timestamp, 
                    post.content, 
                    post.likes,
                    post.pic_src
                    )
                $("#page-container").append(new_post)
                const buttons = new_post.querySelector(".buttons")
                const likeBtn = buttons.querySelector(".like")
                const editBtn = buttons.querySelector(".edit")
                if (post.username === currentUserName) {
                    likeBtn.classList.add("disabled")
                    editBtn.addEventListener('click', (event) => {
                        editPost(event.target.dataset.post_id);
                    })

                } else {
                    editBtn.remove()
                    if (!post.liked) {
                        likeBtn.addEventListener('click', (event) => {
                            trgt = event.target
                            if (trgt.classList.contains("like")) {
                                like(trgt.dataset.post_id, trgt.querySelector(".badge"))
                            } else {
                                like(trgt.parentNode.dataset.post_id, trgt.parentNode.querySelector(".badge"))
                            }
                        })
                    } else {
                        likeBtn.classList.add("disabled")
                    }
                }
            };
        })
        .catch((err) => {
            console.log(err)
        });
        start++;
    }

    get_posts(start);

    const makePost = function(post_id, poster, timestamp, content, likes, img) {
        const post = document.createElement("div");
        post.classList.add("container-fluid");
        post.setAttribute("id", "outer-container")
        post.innerHTML = `<div class="row">
                            <div class="col-md-1 col-sm-2">
                                <a href="/profile/${poster}">
                                    <img src="${img}" alt="profile pic" class="rounded-circle">
                                </a>
                            </div>
                            <div class="col-md-11 col-sm-10">
                                <a href="/profile/${poster}">
                                    <div id="${poster}">${poster}</div>
                                </a>  
                                <span class="timesamp"><small>${timestamp}</small></span>
                                <p class="content">${content}</p>
                                <div id="post-footer">
                                    <span class="buttons">
                                        <button class="btn btn-outline btn-sm like" data-post_id="${post_id}" style="border-style: none;">
                                            <i class="bi bi-heart"></i><span class="badge badge-light ml-2 likes-count">${likes}</span>
                                        </button>
                                        <button class="btn btn-outline btn-sm edit" data-post_id="${post_id}">
                                            <i class="bi bi-pencil"></i>
                                        </button> 
                                    </span>
                                </div>
                            </div>
                        </div>
                        <hr>`
        return post
    }

    
    const like = function(post_id, badge) {
        fetch('/api/like', {
            method: 'POST',
            body: JSON.stringify({
                post_id: post_id
            })
        })
        .then(response => response.json())
        .then((result) => {
            badge.innerHTML = result.like;
            $(`#${post_id}`).attr('disabled', 'true')
        })
        .catch((err) => {
            console.log(err)
        })       
    }

    const newPostToggle = function() {
        $("#page-container").toggleClass('blured')
        $(".new-post").toggleClass('visible')
        $("#new-post-btn").toggle()
        if ($(".new-post").hasClass('visible')) {
            $('#new-post-text').focus() 
        }
    }

    const editPost = function (postId) {
        console.log(`TODO: let ${currentUserName} edit post #${postId}`)
    }
})

