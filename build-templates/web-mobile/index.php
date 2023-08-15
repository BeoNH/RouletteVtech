<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">

  <title>Fish Hunter</title>

  <!--http://www.html5rocks.com/en/mobile/mobifying/-->
  <meta name="viewport"
        content="width=device-width,user-scalable=no,initial-scale=1, minimum-scale=1,maximum-scale=1"/>

  <!--https://developer.apple.com/library/safari/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html-->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="format-detection" content="telephone=no">

  <!-- force webkit on 360 -->
  <meta name="renderer" content="webkit"/>
  <meta name="force-rendering" content="webkit"/>
  <!-- force edge on IE -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
  <meta name="msapplication-tap-highlight" content="no">

  <!-- force full screen on some browser -->
  <meta name="full-screen" content="yes"/>
  <meta name="x5-fullscreen" content="true"/>
  <meta name="360-fullscreen" content="true"/>
  
  <!-- force screen orientation on some browser -->
  <meta name="screen-orientation" content=""/>
  <meta name="x5-orientation" content="">

  <!--fix fireball/issues/3568 -->
  <!--<meta name="browsermode" content="application">-->
  <meta name="x5-page-mode" content="app">

  <!--<link rel="apple-touch-icon" href=".png" />-->
  <!--<link rel="apple-touch-icon-precomposed" href=".png" />-->

  <link rel="stylesheet" type="text/css" href="style-mobile.css"/>
  <link rel="icon" href="favicon.png"/>

  <meta http-equiv="cache-control" content="max-age=0" />
  <meta http-equiv="cache-control" content="no-cache" />
  <meta http-equiv="expires" content="0" />
  <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
  <meta http-equiv="pragma" content="no-cache" />


  <style>
      input {
          text-transform: initial !important;
      }
  </style>

</head>
<body>
  <canvas id="GameCanvas" oncontextmenu="event.preventDefault()" tabindex="0"></canvas>
  <div id="splash">
    <div id="logo" style="display:none !important">
      <div class="progress-bar stripes">
        <span style="width: 0%"></span>
      </div>
    </div>
  </div>
  
	<div id="slide-to-back" style=" background-color: white; display: none">
		<div style="
			height: 30px;
			width: 30px;
			background-color: #04ff00;
			float: left;
		">

			<i style="
				border: solid white;
				border-width: 0 3px 3px 0;
				display: inline-block;
				padding: 3px;
				transform: translate(-25%, 50%)  rotate(-45deg);
				-webkit-transform: translate(-25%, 50%) rotate(-45deg);
				ransform: rotate(135deg);
			"></i>
			
		</div>
		<span style=" margin: 0 auto; line-height: 30px; color: black;">Slide to back</span>
	</div>

<script src="src/settings.js" charset="utf-8"></script>

<script src="main.js" charset="utf-8"></script>

<script type="text/javascript">
(function () {
    // open web debugger console
    if (typeof VConsole !== 'undefined') {
        window.vConsole = new VConsole();
    }

    var splash = document.getElementById('splash');
    splash.style.display = 'block';

    var cocos2d = document.createElement('script');
    cocos2d.async = true;
    cocos2d.src = window._CCSettings.debug ? 'cocos2d-js.js' : 'cocos2d-js-min.js';

    var engineLoaded = function () {
        document.body.removeChild(cocos2d);
        cocos2d.removeEventListener('load', engineLoaded, false);
        window.boot();
		cc.view.enableAutoFullScreen(false);
		
		if(cc.sys.isMobile && cc.sys.os == cc.sys.OS_IOS){
			console.log("add slide right to back");
			cc.game.on("game_inited", function(){
				cc.view.enableAutoFullScreen(false);
				cc.view._initFrameSize = function() {
					var t = this._frameSize,
						e = window.innerWidth,
						i = window.innerHeight - 30,
						n = e >= i;
					!cc.sys.isMobile || n && this._orientation & cc.macro.ORIENTATION_LANDSCAPE || !n && this._orientation & cc.macro.ORIENTATION_PORTRAIT ? (t.width = e, t.height = i, cc.game.container.style["-webkit-transform"] = "rotate(0deg)", cc.game.container.style.transform = "rotate(0deg)", this._isRotated = !1) : (t.width = i, t.height = e, cc.game.container.style["-webkit-transform"] = "rotate(90deg)", cc.game.container.style.transform = "rotate(90deg)", cc.game.container.style["-webkit-transform-origin"] = "0px 0px 0px", cc.game.container.style.transformOrigin = "0px 0px 0px", this._isRotated = !0), this._orientationChanging && setTimeout((function() {
						cc.view._orientationChanging = !1
					}), 1e3)
				}
				
				cc.ContainerStrategy.EQUAL_TO_FRAME.apply = function(t) {
					console.log("okk");
					var e = t._frameSize.height,
						i = cc.game.container.style;
					//this._setupContainer(t, t._frameSize.width, t._frameSize.height), t._isRotated ? i.margin = "0 0 0 " + e + "px" : i.margin = "0px", i.padding = "0px"
					this._setupContainer(t, t._frameSize.width, t._frameSize.height), t._isRotated ? i.margin = "30px 0 0 " + e + "px" : i.margin = "30px 0 0 0", i.padding = "0px"
				}
				
				cc.view.setFrameSize(window.innerWidth, window.innerHeight);
			});
			document.getElementById("slide-to-back").style.display = "block";
		}else{
			document.getElementById("slide-to-back").style.display = "none";
		}
    };
    cocos2d.addEventListener('load', engineLoaded, false);
    document.body.appendChild(cocos2d);
})();
</script>

<script type="text/javascript">
<?php 
$header = apache_request_headers(); 
echo 'const requestHeaders = {';
foreach ($header as $headers => $value) { 
	echo '	"'.strtolower($headers).'": "'.$value.'",';
}
echo '};';
?>
</script>

<!--
<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '1658615544388350',
      xfbml      : true,
      version    : 'v9.0'
    });
    FB.AppEvents.logPageView();
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
</script>
-->

</body>
</html>
