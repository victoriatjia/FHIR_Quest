	let quesID= '196';
	let quesTitle;
	let quesItem= [];
	let loginData;
	
	// ["IoT and Tel-healthcare", "Healthcare chart and form", "Medical image and structured reporting", "Colonic disease healthcare", "Cancer",
	   // "Virtual slide and multimedia", "Genomics", "Workflow management and auditing", "Financial and accounting", "Clinical Decision Support", 
	   // "Security", "Others"]
	   
	//FHIR Questionnaire Response JSON template
	let jsonQR = {
		resourceType: 'QuestionnaireResponse',
		questionnaire: 'Questionnaire/196',
		subject:{
			reference: ''
		},
		authored: '',
		status: 'completed',
		item: []
	}

	//Function Initialization
	$(document).ready(function(){
		//Check session
		loginData= getQueryString();
		//loginData= sessionGet("loginAccount");
		// if(loginData==null) {
			// //redirect users to login page
			// window.location.href = "https://victoriatjia.github.io/FHIR_LMS/LIVE/MISAC/login.html";
		// }
		// else {
			// getResource(FHIRURL, 'Questionnaire', '/' + quesID, FHIRResponseType, 'getQuestionnaire');
		// }
		
		getResource(FHIRURL, 'Questionnaire', '/' + quesID, FHIRResponseType, 'getQuestionnaire');
	});

	function getQuestionnaire(str)
	{
		let obj= JSON.parse(str);
		let temp="";
		if(retValue(obj))
		{
			let temp_quesItem={
				linkId:'',
				question:'',
				type:'',
				required:'',
				option: []
			}
			quesTitle= (obj.title)? obj.title : '';
			if(obj.item)
			{
				obj.item.map((item, i) => {
					
					temp_quesItem.linkId= item.linkId;
					temp_quesItem.question= item.text;
					temp_quesItem.type= item.type;
					temp_quesItem.required= item.required;
					
					item.answerOption.map((opt, i) => {
						temp_quesItem.option.push(opt.valueString);
					});
					quesItem.push(temp_quesItem);
				});
			}
			showForm();
		}
	}
	
	function showForm()
	{	
		// Show Questionnaire Form field
		let temp="";
		quesItem.forEach(function(item) {
			temp+= `<div class="card-header">
						<h3 class="card-title" name="${item.linkId}">${item.question}</h3>
					</div></label>`;
			
			let counter=1;
			item.option.forEach(function(opt) {
				temp += `<label class="custom-control custom-checkbox">
							<input type="checkbox" class="custom-control-input" id="opt${counter}" value="${opt}"`;
				if(counter==1) temp += " checked";
							
				temp += `><span class="custom-control-label">${opt}</span></label>`;
				
				if(opt=="Others")
				{
					temp+= `<div class="mb-3" id="other_textarea" style="display:none">
								<textarea class="form-control is-invalid" id="validationTextarea" placeholder="Other applicaton and brief description" required></textarea>
							</div>`;
				}
				counter++;
			});
			temp+= `<button id="btn-submit" class="btn btn-primary mt-4 mb-0" onclick="submitForm()">Submit</button>`;
		});
		
		$(".page-title:eq(0)").html(quesTitle);
		$(".col-md-12:eq(0)").html(temp);
		
		$("#opt12").change(function(){
			let fieldDisplay= $('#other_textarea').css('display');
			if(fieldDisplay=='block')
				$("#other_textarea").hide();
			else if(fieldDisplay=='none')
				$("#other_textarea").show();
		});
		
		$("#validationTextarea").change(function(){
			let textareaVal= $('#validationTextarea').val();
			if(textareaVal=='')
				replaceClass('validationTextarea', 'is-valid', 'is-invalid');
			else 
				replaceClass('validationTextarea', 'is-invalid', 'is-valid');
		});
		
		$('#btn-submit').on('click', function(e) {
			e.preventDefault();
			document.getElementById("global-loader").style.display="block";
			let obj= validateData();
			if(obj != 0)
			{
				let str= JSON.stringify(obj);
				postResource(FHIRURL, 'QuestionnaireResponse', "", FHIRResponseType, "formSubmitted", str);
			}
			else
			{
				document.getElementById("global-loader").style.display="none";
			}
		});
	}
	
	function formSubmitted(str)
	{
		let obj= JSON.parse(str);
		document.getElementById("global-loader").style.display="none";
		if(retValue(obj))
		{
			swal('Form submitted!', "Thank you for your participation!", 'success');
		}
		else
		{
			swal('Error!', "There is an error while sending message.\nPlease contact victoriatjiaa@gmail.com", 'error');
		}
		document.getElementById("questionnaireForm").reset();
		replaceClass('validationTextarea', 'is-valid', 'is-invalid');
		$("#other_textarea").hide();
	}
	
	
	function replaceClass(id, oldClass, newClass) 
	{
		var elem = $(`#${id}`);
		if (elem.hasClass(oldClass)) {
			elem.removeClass(oldClass);
		}
		elem.addClass(newClass);
	}


	function validateData()
	{
		let checkboxes = $('input:checkbox:checked');
		if(checkboxes.length > 0)
		{
			if($('#opt12')[0].checked && !$("#validationTextarea").val())
			{
				swal('Error!', "Please fill out the textarea field!", 'error');
				return 0;
			}
			else{
				jsonQR.subject.reference= "Person/" + loginData.personID;
				jsonQR.authored= getDate() + 'T' + getTime();
				$('input:checkbox:checked').each(function () {
					let temp={
						linkId: $(this).attr('id'),
						text: $(this).val()
					}
					if($(this).attr('id')=="opt12")
					{
						temp.text= $('#validationTextarea').val();
					}
					
					jsonQR.item.push(temp);
				});
				return jsonQR;
			}
		}
		else
		{
			swal('Error!', "as\nAt least one checkbox must be selected!", 'error');
			return 0;
		}
	}
	
	// Get Date and Time function
	function getDate() 
	{
		var today = new Date();
		var yyyy = today.getFullYear();
		var MM = (today.getMonth() + 1) >= 10 ? (today.getMonth() + 1) : ("0" + (today.getMonth() + 1));
		var dd = today.getDate() < 10 ? ("0" + today.getDate()) : today.getDate();
		return yyyy + "-" + MM + "-" + dd;
	}

	function checkTime(i) 
	{
		return (i < 10) ? "0" + i : i;
	}
		
	function getTime() 
	{
		var today = new Date(),
			hh = checkTime(today.getHours()),
			mm = checkTime(today.getMinutes()),
			ss = checkTime(today.getSeconds());
		return hh + ":" + mm + ":" + ss;
	}
