Email Springboard
=================

Dive right in to a fast, clean and fun way to create responsive emails.

A responsive email builder based around zurb's ink and some custom boilerplate code
that uses as few dependencies as possible, but that leverages gulp, jade and less
to allow the rapid creation and updating of responsive emails with minimum fuss.

Contains a collection of jade mixins that allow you to create layouts very simply
without worrying about having to close tags or expand columns.



Reason To Use
-------------

* It is FAST to compile! (asynchronous gulping)
* Many helper classes for rapid development
* Examples to play around with
* Template files along with preview images
* It is compatible with the majority of email clients



How to use
-------------
* Download the Git repo from (Github)[https://github.com/designerzen/email-springboard.git]
* Install (NodeJS)[https://nodejs.org/en/] (if you have not already installed it)
* Familiarise yourself with (Zurb's Ink)[http://foundation.zurb.com/emails.html]
* Edit the email contents in the email.jade file in the src folder
* Edit the look of the email using the email.less file in the same folder
* Run gulp in a DOS prompt from the root of the folder
	> gulp

	This will build and compile the files into 2 folders :
		- Build/ - where you can debug and test the look of your email
		- Dist/ - Where the email ends up once being compiled and squished

* Copy the contents of the file created in dist folder
* Paste into your mail sending client


Compatibility
---------------

Apple Mail (Desktop)					✔ 	
Apple Mail (iOS)							✔ 	
Outlook (2000, 2002, 2003)		✔ 	
Outlook (2007, 2010, 2013)		✔ 	
Outlook (2011)								✔ 	
Thunderbird										✔ 	
Android												✔ 	
Gmail (Desktop)								✔ 	
Gmail (Mobile, iOS, Android) 	✔ *
Outlook 2011 for Mac 					✔ 	
AOL Mail 											✔ 	
Hotmail 											✔ 	
Outlook.com 									✔ 	

* _Does not fully support the Ink grid. Responsive layouts should be accomplished using the block-grid._

Contains work from :
---------------
	* Zurb's Ink
	* B.Less
	* htmlemailboilerplate.com
