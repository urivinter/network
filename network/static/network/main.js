document.addEventListener('DOMContentLoaded', () => {
    
    let start = 0 // page number    
    
    $("#follow").click( () => {
        const user_id = $("#user").attr("data-user_id")
        const follows_id = $("#follow").attr("data-follow")       
        fetch("/api/follow", {
            method: "POST", 
            body: JSON.stringify({
                user_id: user_id, 
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
        const user_id = $("#user").attr("data-user_id")
        const follows_id = $("#unfollow").attr("data-unfollow")       
        fetch("/api/unfollow", {
            method: "POST", 
            body: JSON.stringify({user_id: user_id, follows_id: follows_id})
        })              
        .then(response => response.json())
        .then((result) => {
            $("#follow").toggle(600);
            $("#unfollow").toggle(600);
        })
    })

    const like_listner = function() {
        $(".like").click((event) => {
            if (event.target.parentNode.tagName === 'BUTTON') {
                const btn = event.target.parentNode
                like(btn.id, btn.querySelector("span"))
            } else {
                like(event.target.id, event.target.querySelector("span"))            
            }
        })
    }

    like_listner();

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

    const get_posts = function() {
        
        fetch('', {
            method: 'POST', 
            body: JSON.stringify({
            start: start
            })
        })
        .then(response => response.json())
        .then((result) => {
            let i = 0;
            let post = null;
            while (post = result[i]) {
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
            };
            like_listner();
        })
        .catch((err) => {
            console.log(err)
        });
        
    }

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
                                    <span>
                                        <button class="btn btn-outline btn-sm like" id="${post_id}" style="border-style: none;">
                                            <i class="bi bi-heart"></i><span class="badge badge-light ml-2 likes-count">${likes}</span>
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
})


