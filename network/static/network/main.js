document.addEventListener('DOMContentLoaded', () => {
    
    let start = 0 // page number    
    
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

    const newPostToggle = function() {
        $("#page-container").toggleClass('blured')
        $(".new-post").toggleClass('visible')
        $("#new-post-btn").toggle()
        if ($(".new-post").hasClass('visible')) {
            $('#new-post-text').focus() 
        }
    }

    $("#new-post-btn").click(() => {
        newPostToggle()
    });

    $('#close-new-post').click(() => {
        newPostToggle()
    });

    $("#post-new-post").click(() => {
        // TODO: add post
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
                new_post.addEventListener('click', () => {
                })
            };
            like_listner();
        })
        .catch((err) => {
            console.log(err)
        });
        
    }


    const like = function(post_id, badge) {
        fetch('/', {
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

    const makePost = function(post_id, poster, timestamp, content, likes, img) {
        const post = document.createElement("div");
        post.classList.add("container-fluid");
        post.setAttribute("id", "outer-container")
        post.innerHTML = `<div class="row">
                            <div class="col-md-1 col-sm-2">
                                <img src="${img}" alt="profile pic" class="rounded-circle">
                            </div>
                            <div class="col-md-11 col-sm-10">
                                <div id="${poster}">${poster}</div>
                                <span class="timesamp"><small>${timestamp}</small></span>
                                <p class="content">${content}</p>
                                <div id="post-footer">
                                    <span>
                                        <button class="btn btn-outline-dark btn-sm like" id="${post_id}" style="border-style: none;"><i class="bi bi-heart"></i><span class="badge badge-light ml-2 likes-count">${likes}</span></button>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <hr>`
        return post
    }

})


