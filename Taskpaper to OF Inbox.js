(() => {
	const baseURL = "omnifocus:///paste";
	
	//set where the taskpaper should be saved
	var target = 'inbox';
	
	//replace any placeholder if they exist
	var known_placeholders = {};
	var placeholders = [];
	
	var draftsContent = editor.getText();
	var matches = draftsContent.match(/«(.+?)»/g);
	
	for (match in matches) {
		var placeholder = matches[match];
		known_placeholders[placeholder] = null;
		placeholders.push(placeholder);
	}
	
	if (placeholders.length === 0) {
		var alert = Prompt.create();
		alert.title = "No template placeholders were found.";
		alert.body = "If your project text has placeholders (that look like «this»), this script will prompt for values you'd like to substitute for them.";
		var alertCancelled = alert.addButton("Continue Anyway");
		if (alertCancelled === false) {
			cancel("User cancelled the script");
		}
	}	else {
		for (var placeholder in known_placeholders) {
			var showPlaceholder = placeholder.replace("«", "");
			showPlaceholder = showPlaceholder.replace("»", "");
			var placeholderQuery = Prompt.create();
			placeholderQuery.title = placeholder;
			placeholderQuery.addTextField("placeholder", "", showPlaceholder);
			placeholderQuery.addButton("OK");
			placeholderQuery.isCancellable = false;
			placeholderQuery.show();
	
			draftsContent = draftsContent.replace(new RegExp(placeholder, 'g'), placeholderQuery.fieldValues["placeholder"]);
		}
	}
	
	//send this to OmniFocus
	var cb = CallbackURL.create();
	cb.baseURL = baseURL;
	cb.addParameter("target", target);
	cb.addParameter("content", draftsContent);
	// open and wait for result
	var success = cb.open();
	if (success) {
		console.log("Taskpaper added to OF inbox");
		
		//If there were any placeholders offer to save the changes
		if (placeholders.length) {
			var myPrompt = Prompt.create();
			myPrompt.addButton("Save as new Draft");
			myPrompt.addButton("Update current Draft");
			myPrompt.addButton("Do nothing");
			myPrompt.isCancellable = false;
			myPrompt.show();
			
			switch(myPrompt.buttonPressed) {
				case "Save as new Draft":
					var d = Draft.create();
					d.content = draftsContent;
					d.update();
					break;
				case "Update current Draft":
					editor.setText(draftsContent);
					break;
				case "Do nothing":
					break;
			}
		}
	}
	else { // something went wrong or was cancelled
	  	console.log(cb.status);
	  	if (cb.status == "cancel") {
			context.cancel();
		}
		else {
			context.fail();
		}
	}	
})();
