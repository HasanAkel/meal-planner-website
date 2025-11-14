document.querySelectorAll('.time-filter-btn').forEach(button => {button.addEventListener('click',function() {
	document.querySelectorAll('.time-filter-btn').forEach(button => button.classList.remove('active'));
	this.classList.add('active');
	//this should then update the displayed data with regards to the selected time when fully implemented
	});
});
