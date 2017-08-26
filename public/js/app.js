$(document).ready(function() {
  // Grab the articles as a json
  $.getJSON("/articles", function(data) {
    console.log("getting json");
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "</p>" + "<button class='commentsBtn'> Add Comments </button>");
    }
  });

	// Comment button opens the comments modal & displays any comments
	$(document).on("click", ".commentsBtn", function() {
		$(".modal").toggleClass("is-active");
		var articleid = $(this).attr("data-id");
		// Now make an ajax call for the Article
	  $.ajax({
	    method: "GET",
	    url: "/articles/" + articleid
	  }).done(function(data) {
	  	$("#commentsTitle").html("Article Comments (ID: " + data._id + ")");
	  	if (data.comments.length !== 0) {
	  		$("#comments").empty();
	  		for (i = 0; i < data.comments.length; i++) {
	  			// Append all article comments
					$("#comments").html("<div class='comment-div'><p class='comment'>" + data.comments[i].body + "</p></div>");
	  		}
	  	}
	  });
	});

});


