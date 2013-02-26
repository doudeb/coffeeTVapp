var decalage = 0
    , nb = -1
    , objJson
    , couleur = new Array('#419ac2','#ffd700','#3bd322','#419ac2','#419ac2','#ff9c00','#ffd700','#3bd322','#419ac2','#f80077')
    , auth_token = localStorage.getItem("auth_token");

if (!auth_token) {
    window.location.href = 'index.html';
}

function loadPost (isReload) {
    $.ajax({
        type: 'GET'
        , url: "http://api.coffeepoke.com/services/api/rest/json"
        //, url: "http://api.coffee.enlightn.doudeb/services/api/rest/json"
        , dataType: 'json'
        , data: {
            method: 'coffee.getTVPosts'
            , auth_token: auth_token
            , offset: 0
            , limit: 10
        },
        success: function (response) {
            try {
                navigator.splashscreen.hide();
            } catch(e) {}
            $('.roue').find('span').html('').attr('data-guid',null).attr('data-user',null);
            objJson = [];
            decalage = 0;
            objJson = response.result.posts;
            if (response.status != -1) {
                nb = objJson.length-1;
                $.each(objJson, function(i,item) {
                    $('.roue span:eq('+i+')').html(' ' + item.user.name).attr('data-guid',item.guid).attr('data-user',item.user.name);
                });
                if (!isReload)
                    startRoue();
            } else if (response.message == 'pam_auth_userpass:failed') {
                localStorage.removeItem("auth_token");
                window.location.href = 'index.html';
            }
        }
    });
}


// Premier demarrage

function startRoue()
{
	$('.roue').animate({ opacity:1 },1000, function() {
		$('.roue').addClass('tournerRoue');
	});
	setTimeout("animationTxt(0)",6000);
}

function animationTxt(id) {
	$('#usernameBlanc').html($('.roue span:first').attr('data-user'));

	$('#usernameBlanc').animate({ opacity:1 },500);
	$('.roue').animate({ opacity:0 },1500, function() {
        $('#usernameBlanc, #img')
            .hide()
            .addClass('decalageTop');
        $('#usernameBlanc').fadeIn();
            setTimeout("animerPost(" + id + ")",1500);
	});
}

function animerPost(id) {
	var post = objJson[id]
        , seconds = 10000;
    if (!_.isArray(objJson) || !_.isObject(post)) setTimeout("arreterRoue()",seconds);

    $('#icon_url').attr('src',post.user.icon_url);
    if (!_.isNull(post.user.cover_url)) {
        $('#fond_icon_url').attr('src',post.user.cover_url).show();
    }
    $('#img').fadeIn();
    if(post.content.text.length > 250)
        $('#text').html(post.content.text.replace(/<br \/>/g," ").substr(0,250) + ' ...').fadeIn();
    else
        $('#text').html(post.content.text.replace(/<br \/>/g," ")).fadeIn();
    $('#fond_icon_url').css('display','block');
    if(post.attachment != false) {
        $('#marges').removeClass('link image video');
        if(post.attachment[0].type == "image") {
            $('#marges').addClass('image');
            $('#miniatureAtt').html('<img src="' + post.attachment[0].thumbnail + '" class="gloss" />');
            setTimeout("arreterRoue()",seconds);
        } else {
            $('#miniatureAtt').html('<a href="' + post.attachment[0].url + '" target="_blank"><img src="' + post.attachment[0].thumbnail + '" class="gloss" /></a>');
            // Video ?
            var idVideo = post.attachment[0].url.replace(/http:\/\/www.youtube.com\/watch\?v=/gi,"");
            if(idVideo != post.attachment[0].url) {
                // Video
                $('#marges').addClass('video');
            } else {
                $('#marges').addClass('link');
                $('#titreAtt').html(post.attachment[0].title);
                if(post.attachment[0].description.length > 140)
                    $('#descAtt').html(post.attachment[0].description.substr(0,140) + ' ...').show('blind');
                else
                    $('#descAtt').html(post.attachment[0].description.replace(/<br \/>/g," ")).show('blind');
            }
            setTimeout("arreterRoue()",seconds);
        }
        $('#attachment').fadeIn();
    } else {
        $('#attachment').hide();
        setTimeout("arreterRoue()",seconds);
    }
}

// Reinitialisation
function arreterRoue() {
	$('.roue').removeClass('tournerRoue');
	$('#img, #usernameBlanc').removeClass("decalageTop");
	$('#usernameBlanc').hide();
	setTimeout("decalerSpan()",500);
	$('#likes, #text, #friendly_time, #attachment, #fond_icon_url').fadeOut();
	$('#usernameBlanc').animate({ opacity:0},1500,null, function() {
		$('#usernameBlanc').show();
	});
	$('#miniatureAtt, #titreAtt, #descAtt, #typeAtt').html('');
	$('#cadre, body').animate({ backgroundColor: couleur[decalage] },1000);
}

function decalerSpan() {
	$('.roue span:first').appendTo('.roue');
	$('.roue').animate({ opacity:1 },300, function() {
        $('#usernameBlanc').html('');
        $('.roue').addClass('tournerRoue');
    });
	decalage++;
	if(decalage > nb) {
		decalage = 0;
        loadPost(true);
	}
	setTimeout('animationTxt(' + decalage + ')',6000);
}

loadPost();