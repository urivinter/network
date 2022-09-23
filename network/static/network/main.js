document.addEventListener('DOMContentLoaded', () => {

    const currentUserName = $("#user > strong").html();
    const textAreaPlaceholder = "Share your thoughts";
    const textArea = $("#new-post-text")
    textArea.attr("placeholder", textAreaPlaceholder)

    $("#follow").click( () => {
        const follows_name = $("#profileUsername").html()      
        fetch("/api/follow", {
            method: "POST", 
            body: JSON.stringify({
                follows_name: follows_name
            })
        })              
        .then(response => response.json())
        .then(() => {
            $("#follow").toggle(600);
            $("#unfollow").toggle(600);
        })
    })

    $("#unfollow").click( () => {
        const follows_name = $("#profileUsername").html()       
        fetch("/api/unfollow", {
            method: "POST", 
            body: JSON.stringify({follows_name: follows_name})
        })              
        .then(response => response.json())
        .then(() => {
            $("#follow").toggle(600);
            $("#unfollow").toggle(600);
        })
    })

    $("#new-post-btn").click(() => {
        newPostToggle()
    });

    $('#close-new-post').click(() => {
        newPostToggle()
        textArea.attr("placeholder", textAreaPlaceholder)
        textArea.val("")
        $("#post-new-post").attr("data-post_id").remove()
    });

    $("#post-new-post").click((event) => {
        const content = textArea.val()
        const trgt = event.target.tagName === "I" ? event.target.parentNode : event.target;
        const postId = trgt.dataset.post_id

        fetch('/api/post', {
            method: 'POST', 
            body: JSON.stringify({
            content: content, 
            post_id: postId
            })
        })
        .then(response => response.JSON)
        .then((result) => {
            textArea.attr("placeholder", textAreaPlaceholder)
            textArea.val("")
            $("#post-new-post").attr("data-post_id", "")
        })
        newPostToggle()
    });


    const get_posts = function(page=1) {
        console.log(document.URL)
        fetch(`?page=${page}`)
        .then(response => response.json())
        .then((result) => {
            $("#page-container").html("")
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
                        const trgt = event.target.tagName === "I" ? event.target.parentNode : event.target;
                        const content = trgt.parentNode.parentNode.previousSibling.previousSibling.innerHTML
                        editPost(trgt.dataset.post_id, content);
                    })

                } else {
                    editBtn.remove()
                    if (post.liked == false) {
                        likeBtn.addEventListener('click', function clicked(event) {
                            const trgt = event.target
                            if (trgt.classList.contains("like")) {
                                like(trgt.dataset.post_id, trgt.querySelector(".badge"))
                                trgt.removeEventListener('click', clicked)
                                likeBtn.querySelector("i").classList.remove("bi-heart")
                                likeBtn.querySelector("i").classList.add("bi-heart-fill")
                            } else {
                                like(trgt.parentNode.dataset.post_id, trgt.parentNode.querySelector(".badge"))
                                trgt.parentNode.removeEventListener('click', clicked)
                                likeBtn.querySelector("i").classList.remove("bi-heart")
                                likeBtn.querySelector("i").classList.add("bi-heart-fill")
                            }
                        })
                    } else {
                        likeBtn.classList.add("disabled")
                        if (post.liked != null) {
                            likeBtn.querySelector("i").classList.remove("bi-heart")
                            likeBtn.querySelector("i").classList.add("bi-heart-fill")
                        }
                    }
                }
            };
            
            // pagination
            $("#next > a").attr("data-page", page);
            $("#previous > a").attr("data-page", page);
            if (nextPage = result.next) {
                $("#next").removeClass("disabled");
                $("#next").click( (event) => {
                    // history.pushState({page: event.target.dataset["page"]}, '');
                    get_posts(nextPage)
                })
            } else {
                $("#next").addClass("disabled").off();

            }
            if (previousPage = result.previous) {
                $("#previous").removeClass("disabled");
                $("#previous").click( (event) => {
                    // history.pushState({page: event.target.dataset["page"]}, '');
                    get_posts(previousPage)
                })
            } else {
                $("#previous").addClass("disabled").off();
            }

        })
        .catch((err) => {
            console.log(err)
        });

    }

    get_posts();

    const makePost = function(post_id, poster, timestamp, content, likes, img) {
        const post = document.createElement("div");
        post.classList.add("container-fluid");
        post.setAttribute("id", "outer-container")
        post.innerHTML = `<div class="row" data-post_id="${post_id}">
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
            badge.innerHTML = result.likeCount;
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

    const editPost = function (postId, content) {
        textArea.attr("placeholder", "");
        textArea.val(content)
        newPostToggle();
        $("#post-new-post").attr("data-post_id", postId)
    }

})

