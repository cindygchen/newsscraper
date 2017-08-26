$(document).ready(function() {
  // Grab the articles as a json
  $.getJSON("/articles", function(data) {
    console.log("getting json");
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "</p>" + "<button data-id=" + data[i]._id + " class='commentsBtn'> Add Comments </button>");
    }
  });

	// Comment button opens the comments modal & displays any comments
	$(document).on("click", ".commentsBtn", function() {
		$("#comments-section").css("display", "block");
		var articleid = $(this).attr("data-id");
		// Now make an ajax call for the Article
    console.log("testing");
	  $.ajax({
	    method: "GET",
	    url: "/articles/" + articleid
	  }).done(function(data) {
	  	$("#commentsTitle").html("Article Comments (ID: " + data._id + ")");
      console.log(data);
      $("#submitBtn").append("<button data-id='" + data._id + "' id='submit'> Submit </button>");
	  	if (data.comment.length !== 0) {
	  		$("#comments").empty();
	  		for (i = 0; i < data.comment.length; i++) {
	  			// Append all article comments
					$("#comments").html("<div class='comment-div'><p class='comment'>" + data.comment[i].body + "</p></div>");
	  		}
	  	}
	  });
	});

//Click function to save comments
$(document).on("click", "#submit", function() {
		var articleid = $(this).attr("data-id");
    	$.ajax({
        method: "POST",
        url: "/savecomment/" + articleid,
        data: {
          body: $("#commentField").val()
        }
      }). done(function(data) {
        console.log("data: ", data);
      })
      $("#commentField").val("");
		$("#comments-section").css("display", "none");
});



});



