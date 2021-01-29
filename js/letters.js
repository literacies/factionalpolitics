if (Modernizr.history){
	
	var base_url = document.location.protocol + '//' + document.location.host||document.location.hostname;
	var file_list = new Array();
	var last_page = 0;
	
	$(document).ready(function(){
		setup_footer();
		$("body").control_links();
		update_content();
		$(".overlay").click(function(){
			close_popup();
		});
	});


	$.fn.control_links = function(){
		$(this).find("a").unbind("click").bind("click",function(){
			var ref = $(this).attr("href").split('/').pop();
			
			if (ref.substr(0,6) === 'cartas'){
				ref = '/factionalpolitics/letters/'+ref;
			} else if (ref.substr(0,1) != '#') {
				ref = '/factionalpolitics/'+ref;
			}
			if (ref.indexOf('footnote')>-1){
				get_note(this,ref);
			} else if ((ref.indexOf('Biographicalindex')>-1)&&(ref.indexOf('#')>-1)){
				get_bio(this,base_url+ref);
			} else if (ref.indexOf('mailto')>-1){
				return true;
			} else {
				var url = parse_url(base_url+ref);
				var file = url.file;
				var file_hash = url.file_hash;
				history.pushState({},'',base_url+ref);
				load_content(file,file_hash);
			}
			return false;
		});
	}

	
	function setup_footer(){
		$(".back").hide();
		$(".forward").hide();
		$(".up").text("Return to Top");
		$(".up").on("click",function(event){
			return_to_top();
			event.preventDefault;
			return 0
		});
	}
	
	function update_content(){
		var ref = location.pathname;
		var hash = location.hash;
		var url = parse_url(ref+hash);
		var file = url.file;
		var file_hash = url.file_hash;
		load_content(file,file_hash);
	}
	
	
	function parse_url(ref){
		var hash_index = ref.indexOf("#");
		if (hash_index > -1){
			var file = ref.substring(0,hash_index);
			var file_hash = ref.substring(hash_index+1);
		} else {
			var file = ref;
			var file_hash = "";
		}
		return {file:file,file_hash:file_hash};
	}
	
	function get_note(tab,ref){
		var footnote = $(ref).parents("p").text();
		$(".popup_content").html(footnote);
		position_Popup(tab);
	}
	
	function get_bio(tab,ref){
		var elements = ref.split("#");
		var file = elements[0];
		var id = elements[1];
		$.ajax({
			url: file,
			dataType: "html",
			data: {},
			type: "GET",
			beforeSend: function(xhr) {
				xhr.overrideMimeType('text/html; charset=iso-8859-1');
		   },
			success: function(response) {
				var table = $(response).find("ul");
				var bio_name = $(table).find("div#"+id).text();
				var bio_text = $(table).find("div#"+id).parent().find(".bio_info").html();
				var bio_links = $(table).find("div#"+id).parent().find(".mentioned_in").html();
				$(".popup_title").html(bio_name);
				$(".popup_content").html(bio_text);
				$(".popup_content").append('<p class = "sup narrow">See also:</p>');
				$(".popup_content").append('<p class="sup">'+bio_links+'</p>');
				position_Popup(tab);
			},
			error: function(response,status,xhr){
				console.log(xhr.status + " " + xhr.statusText);
			}
		});
	}
	
	
		
	
	
	function position_Popup(tab){
		var linkoffset = $(tab).offset();
		var contentoffset = $("#content").offset();
		var p_left = linkoffset.left - contentoffset.left;
		var p_top = linkoffset.top - contentoffset.top + 30;
		var maxw = $("#content").width();
		var popw = $(".popup").width();
		if (p_left + popw > maxw - 30){
			p_left = maxw - popw - 30;
		} 
		var extrah = $(".heading").height() + $("nav").height();
		
		var maxt = $("#content").height();
		var popt = $(".popup").height();
		var viewh = window.innerHeight + $(window).scrollTop();
		var poph = p_top + popt+contentoffset.top;
		if ((poph > viewh)&&(p_top > popt+extrah)){  
			p_top = p_top - (popt+60);
		}
		$(".popup").css({
			left:p_left,
			top:p_top
		});
		$(".popup_content").control_links();
		$(".popup").fadeTo(100,1);
		$(".overlay").fadeTo(100,1);
	}
	
	function close_popup(){
		$(".popup").fadeTo(100,0,function(){
		$(".popup_title").text("");
		$(".popup_content").text("");
		});
		close_overlay();
		return false;
	}
	
	function close_overlay(){
		$(".overlay").fadeTo(100,0,function(){
			$(".overlay").hide();
		});
	}
	
	function return_to_top(){
		$('html, body').animate({scrollTop:0}, 'slow');
	}
	
	
	
	function load_nav(file,file_hash,sections){
		var current_section = $(sections).filter("#"+file_hash);
		var file = file.replace(base_url,'');
		if (sections.length === 1){
			if ($(current_section).attr("id") === "table_of_contents"){
				var prev_link = "";
				var prev_text = "";
				var next_link = "";
				var next_text = "";
			} else {
				var prev_link = "/";
				var prev_text = "Home";
				var next_link = "";
				var next_text = "";
			}
		} else {
			if ($(current_section).index() === 0){
				if ($("#content").data("back").length > 0){
					prev_file = $("#content").data("back");
					var prev_link = prev_file;
					var prev_text = "Prev";
					last_page = 1;
				} else {
					var prev_link = "/";
					var prev_text = "Home";
					last_page = 0;
				}
				var next_link = file+"#"+$(current_section).next().attr("id");
				var next_text = "Next";
			} else if ($(current_section).index() === sections.length - 1){
				last_page = 0;
				if (file.indexOf("dec47")>-1){
					var next_link = "";
					var next_text = "";
				} else if ($("#content").data("forward").length > 0){
					next_file = $("#content").data("forward");
					var next_link = next_file;
					var next_text = "Next";
				} else {
					var next_link = "";
					var next_text = "";
				}
				var prev_link = file+"#"+$(current_section).prev().attr("id");
				var prev_text = "Prev";
			}
			else {
				last_page = 0;
				var prev_link = file+'#'+$(current_section).prev().attr("id");
				var prev_text = "Prev";
				var next_link = file+"#"+$(current_section).next().attr("id");
				var next_text = "Next";
			}
					
		}
		$(".prev").text(prev_text);
		$(".prev").attr("href",prev_link);
		$(".next").text(next_text);
		$(".next").attr("href",next_link);
		
		$("nav").control_links();
	}
	
	
	
	function process_hash(file,file_hash,scroll_to,sections){	
		if (file_hash.substr(0,8)==='footnote'){
			file_hash = 'n'+file_hash.substr(8);
		}								
		if (file_hash === ""){
			if (last_page === 1){
				file_hash = $(sections).last().attr("id");
				last_page = 0;
			} else {
				file_hash = $(sections).first().attr("id");
			}
			if (sections.length > 1){
				history.replaceState(null,null,file+"#"+file_hash);
			}
		} else {
			var count = 0;
			for (var i=0;i<sections.length;i++){
				var section = sections[i];
				if ($(section).attr("id")===file_hash){
					count = count+1;
				} 
			}
			if (count === 0){
				scroll_to = '#'+file_hash;
				file_hash = $(sections).has('#'+file_hash).attr('id');
				if (sections.length > 1){
					history.replaceState(null,null,file+'#'+file_hash);
				//} else {
				//	history.replaceState(null,null,file);
				}
			}
		}
		return {file:file,file_hash:file_hash,scroll_to:scroll_to};
	}
	
	
	
	function setup_page(file,file_hash,response,heading,sections,scroll_to){
		// setup popup
		var popup =$("#popup_template").clone();
		$(popup).removeAttr("id");
		$(popup).addClass("popup");
		
		if ((file.indexOf('cartas')>-1)||(file.indexOf('biographies')>-1)||(file.indexOf('Preamble'>-1))){
			var footnotes = $('<div/>').append(response).find("#footnotes");
			$("#clipboard").html(footnotes);
			$("#clipboard").hide();
		} else {
			$("#clipboard").html("");
		}
		$(".heading").text(heading);
		
		// get back and forward links from footer
		if ($(response).find(".back").find("a[href]").length){
			var back_link = $(response).find(".back").find("a").attr("href");
		} else {
			var back_link = "";
		}
		if ($(response).find(".forward").find("a[href]").length){
			var forward_link = $(response).find(".forward").find("a").attr("href");
		} else {
			var forward_link = "";
		}
		$("#content").data("back",back_link);
		$("#content").data("forward",forward_link);
		

		
		close_overlay();
		$(sections).filter("section").not("#"+file_hash).hide();
		$(sections).filter("#"+file_hash).show();
		$("#content").html(sections);
		$("#content").append(popup);
		$("#content").control_links();
		$("#header").control_links();	
		
		
		
		load_nav(file,file_hash,sections);
		$("#content").fadeTo(200,1);
		if (scroll_to.length > 0){
			$('html, body').animate({
				scrollTop: $(scroll_to).offset().top
			}, 1000);
		} else {
			return_to_top();
		}
	}
		
	
	
	
	function load_content(file,file_hash){
		
		$("#content").fadeTo(200,0,function(){
			$.ajax({
				url: file,
				dataType: "html",
				data: {},
				type: "GET",
				beforeSend: function(xhr) {
					xhr.overrideMimeType('text/html; charset=iso-8859-1');
			   },
				success: function(response) {
					var title = $(response).contents().eq(0).text();
					document.title = title;
					var heading =$(response).find(".heading").text();
					var sections = $('<div/>').append(response).find('section');
					var scroll_to = "";
					
					var file_array = process_hash(file,file_hash,scroll_to,sections);
					file = file_array.file;
					file_hash = file_array.file_hash;
					scroll_to = file_array.scroll_to;
					setup_page(file,file_hash,response,heading,sections,scroll_to);
						
				}
			});
		});
	}
	
	$(window).bind("popstate",function(){
		update_content();
	});
}
