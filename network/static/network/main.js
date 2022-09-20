document.addEventListener('DOMContentLoaded', () => {
    
    const container = document.querySelector("#page-container")
    // clear main div
    $(".following").click( () => {
        container.innerHTML = "";
        get_posts();
        $(".like").click((event) => {
            like(event.target.id)
        })
    
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

    $(".like").click((event) => {
        if (event.target.parentNode.tagName === 'BUTTON') {
            const btn = event.target.parentNode
            like(btn.id, btn.querySelector("span"))
        } else {
            like(event.target.id, event.target.querySelector("span"))            
        }
    })

    const get_posts = function() {
        
        fetch('', {method: 'POST'})
        .then(response => response.json())
        .then((result) => {
            let i = 0;
            let post = null;
            while (post = result[i]) {
                i++;
                // result.forEach((post) => {
                $("#page-container").append(makePost(
                    post.id, 
                    post.username, 
                    post.timestamp, 
                    post.content, 
                    post.likes, 
                    post.pic_src
                    ))
            };
        })
        .catch((err) => {
            console.log(err)
        });
        
    }


    const like = function(post_id, badge) {
        fetch('', {
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


