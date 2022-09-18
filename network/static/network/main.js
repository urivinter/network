document.addEventListener('DOMContentLoaded', () => {

    const newPostToggle = function() {
        $("#page-container").toggleClass('blured')
        $(".new-post").toggleClass('visible')
        if ($(".new-post").hasClass('visible')) {
            $('#new-post-text').focus() 
        }
    }

    $("#new-post").click(() => {
        newPostToggle()
    });

    $('#close-new-post').click(() => {
        newPostToggle()
    });

    $("#post-new-post").click(() => {
        // TODO: add post
        newPostToggle()
    });



})