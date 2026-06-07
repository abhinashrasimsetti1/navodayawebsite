# Jawahar Navodaya Vidyalaya Website

I am a former student of Jawahar Navodaya Vidyalaya. I studied there and it was one of the best times of my life. I built this website for my school because I wanted to give something back to the place that gave me so much. JNV provides free residential education to gifted children from all over India. Students come from different backgrounds, different villages, different towns, and they all study together, live together, and grow together. That is what makes JNV special. I wanted to create a website that reflects that spirit.

## About Jawahar Navodaya Vidyalaya

Jawahar Navodaya Vidyalayas, or JNVs, are a system of residential schools in India. They were started in 1986 under the National Policy on Education. The goal was to identify talented children from rural areas and give them access to quality education. Today there are more than 650 JNVs across the country.

Admission to JNV is through the JNVST or Jawahar Navodaya Vidyalaya Selection Test. This exam is held every year for entry into Class 6. The test is designed to find talent regardless of a childs background or economic status. Once admitted, everything is free. Tuition, boarding, lodging, books, uniforms. Everything.

The curriculum follows the CBSE board from Class 6 to Class 12. Students study science, mathematics, social science, languages, and computers. In senior secondary, they can choose from science, commerce, or humanities streams. Beyond academics, there are sports, music, dance, drama, NCC, scouts, debates, and many other activities. The goal is to develop the whole person, not just the student.

## About This Website

This is a static website. That means there is no backend server running anywhere. There is no database. There is no admin panel. It is just HTML files, CSS files, and a JavaScript file. You can open the folder on your computer and the website works in your browser. You can upload it to any hosting service and it works. It will never break or go down because there is nothing running in the background.

The website contains all the important information about the school. Academics, admissions, campus life, contact details. Everything a parent or student would want to know when they are looking for information about JNV.

## Technologies I Used

I kept the technology very simple. I did not want to use frameworks or build tools because they add complexity. This is a school website and it should be easy for anyone to understand and modify.

**HTML** is used for the structure of every page. Headings, paragraphs, images, links, forms. All the content is written in HTML.

**CSS** is used for the visual design. Colours, fonts, spacing, layouts, animations. I used CSS custom properties also known as CSS variables to keep the colour scheme consistent. If you want to change the primary colour of the website, you only need to change one value at the top of the style.css file.

**JavaScript** is used for interactive features. The scroll progress bar at the top, the sticky header, the mobile hamburger menu, the animated counters in the statistics section, the fade in effects when you scroll, and the contact form submission. All of this is written in plain JavaScript with no libraries.

**Font Awesome** provides the icons you see throughout the site. The graduation cap, the leaf, the trophy, the icons in the campus section. All of them come from Font Awesome.

**Google Fonts** provides the fonts. I used Inter and Outfit because they are clean, modern, and easy to read on screens.

**Vercel** is where the site can be hosted for free. Vercel is a cloud platform that serves static sites. It provides a free URL, automatic HTTPS, and a global CDN so the site loads fast everywhere in the world.

**Git and GitHub** are used to manage the code. Git tracks changes and GitHub stores the code online so it can be deployed and shared.

## Project Structure

Here is how the files are organised in this project.

```
assets/
  images/
    hero/
      college-logo.svg

css/
  style.css
  responsive.css

js/
  main.js

pages/
  about.html
  academics.html
  admissions.html

index.html
vercel.json
README.md
```

The assets folder contains images. Right now it only has the JNV logo in SVG format. SVG means scalable vector graphics. It looks sharp on any screen size.

The css folder contains two files. Style.css has all the styling for the website. Responsive.css contains the styles that activate on smaller screens like phones and tablets.

The js folder contains one JavaScript file. It handles all the interactive features on the website.

The pages folder contains three pages. About, academics, and admissions. These are separate HTML files that go into more detail on each topic.

Index.html is the main homepage. Vercel.json tells Vercel how to serve the site. README.md is this file you are reading now.

## Detailed Walkthrough of the Homepage

The homepage is divided into sections. Each section has a specific purpose.

**Header and Navigation.** At the very top of the page there is a navigation bar. It contains the school logo, the school name, and links to different sections of the page. On mobile phones, the navigation links are hidden behind a hamburger menu button. When you scroll down, the header becomes smaller and gets a shadow. There is also a thin progress bar at the very top of the page that fills up as you scroll down. It shows how much of the page you have read.

**Hero Section.** This is the big welcome area at the top. It has the main message of the website. There is a badge that says admissions are open. There is a heading that says Where Talent Meets Opportunity. There is a short description about the school. There are two buttons. One for applying and one for exploring more. On the right side, there is a card that shows some numbers about the school. Below that, there are four statistics. Students enrolled, qualified teachers, board pass rate, and years of legacy. The background is a solid dark blue colour.

**Pillars Section.** This section shows four key points about JNV. Free education, CBSE affiliation, residential campus, and that it is under the Ministry of Education. Each point is shown in a card with an icon and a short description.

**About Section.** This gives a brief introduction to JNV. It talks about how JNVs are residential schools that provide free education to gifted children from all backgrounds. It mentions that there are more than 650 schools across the country. There are three numbers at the bottom. Schools, students, and years since establishment.

**Academics Section.** This explains the academic structure. There are three cards. The first card is about secondary education from Class 6 to 10. The second card is about senior secondary from Class 11 to 12 with different streams. The third card is about holistic development including NCC, sports, music, debate, and other activities.

**Statistics Bar.** A horizontal bar with four big numbers. Students enrolled, qualified teachers, years of legacy, and board pass rate. These numbers have an animation where they count up from zero when you scroll to them.

**Admissions Section.** This shows the admission process in a timeline format. There are five steps. Online registration, JNVST examination, result and counselling, document verification, and welcome to JNV. Each step has a number and a description.

**Campus Section.** This describes the campus facilities. The school is spread across 30 acres. There is a featured card at the top and then a list of facilities below. Library, science labs, computer lab, sports complex, cultural hall, and residential houses. Each facility has an icon and a short description.

**Testimonials Section.** This shows quotes from former students. The testimonials scroll horizontally in a loop. This creates a nice visual effect of an endless stream of positive feedback from alumni.

**Contact Section.** This has a contact form where visitors can send a message. The form has fields for name, email, phone number, and message. Currently, when you submit the form, it shows a thank you message. It does not actually send the data anywhere because there is no backend. This can be connected to a service like Formspree or Web3Forms later if needed.

**Footer.** At the bottom of the page, there is a footer with the school logo, a brief description, quick links to different sections, and social media icons. The social media links currently point to placeholder hashtags because the school may not have official social media pages.

## Detailed Walkthrough of the Sub Pages

**About Page.** The about page at pages/about.html has a header section with a title, and then detailed content about the school. It talks about the history of JNV, the mission, the vision, and the values. There is also a section about the schools achievements and another section about the staff and faculty.

**Academics Page.** The academics page at pages/academics.html explains the curriculum in detail. It covers the subjects taught in Class 6 to 10. It then explains the three streams available in Class 11 and 12. Science with PCM or PCB, Commerce with Economics, and Humanities with Psychology. There is also information about the examination system and the co-curricular activities.

**Admissions Page.** The admissions page at pages/admissions.html provides detailed information about how to apply. It explains the eligibility criteria, the age requirements, the reservation policies, and the step by step process. It also has answers to frequently asked questions about the admission process.

## Features of the Website

The website has several features that make it look professional and work well.

**Responsive Design.** The website works on all screen sizes. Desktop, laptop, tablet, and mobile phone. The layout adjusts automatically. On mobile, the navigation becomes a hamburger menu. The grid layouts stack vertically. Font sizes are smaller. Everything is designed to be usable on any device.

**Scroll Animations.** As you scroll down the page, elements fade in and slide up. This creates a smooth and polished experience. The animation is done using the Intersection Observer API in JavaScript. It only triggers once, so elements do not reanimate when you scroll back up.

**Animated Counters.** The numbers in the statistics sections count up from zero to their final value. This creates an engaging visual effect. The animation uses requestAnimationFrame for smooth performance and an easing function so the counting slows down as it reaches the final number.

**Smooth Scrolling.** When you click on a navigation link, the page scrolls smoothly to the target section instead of jumping instantly.

**Sticky Header.** The header bar stays at the top of the page as you scroll. When you scroll down, it becomes smaller and gets a shadow background so it stands out from the content behind it.

**Scroll Progress Indicator.** A thin coloured bar at the very top of the page shows how far you have scrolled. It starts at zero on the left and reaches 100 percent on the right when you reach the bottom.

**Testimonial Carousel.** The testimonials section creates an infinite scrolling effect. The content is duplicated so it loops seamlessly without any gaps.

**Back to Top Button.** When you scroll down far enough, a button appears in the bottom right corner. Clicking it scrolls smoothly back to the top of the page.

**Contact Form.** The contact form validates that all fields are filled. When you submit, it shows a loading animation for a moment and then displays a thank you message. The form does not send emails currently but it can be connected to a form service easily.

## How to Make Changes

Since this is plain HTML and CSS, making changes is very straightforward.

**To change the text content.** Open the HTML file in any text editor and edit the text directly. All the content is written inside the HTML tags.

**To change the colours.** Open css/style.css and look for the section at the top that starts with root. Change the colour values there. For example, change the primary colour from dark blue to any colour you want.

**To change the images.** Place your image files in the assets/images/ folder. Then in the HTML file, update the image source paths to point to your new files.

**To add a new page.** Create a new HTML file in the pages/ folder. Copy the header and footer from an existing page to keep the same look and feel. Add a link to the new page in the navigation bar.

**To add photos to the gallery.** Create a new gallery section in index.html. Add image elements pointing to your photo files in assets/images/. The gallery filter and lightbox code will need to be added back as well.

## About Photos

The gallery section and all image references have been removed from the code. The placeholder images that were there before were not real photographs. They were just coloured boxes with labels on them. I did not want to show those on the website because they look unprofessional.

When I have real photographs of the school campus, the buildings, the classrooms, the labs, the library, the sports ground, and the events, I will add them back to the website. The folder structure is ready. I just need the actual photos.

## How to Deploy

Because this is a static website, deploying it is very simple. There are no servers to configure and no databases to set up. You just need a place to serve the files.

**On Vercel.** First push the code to a GitHub repository. Then go to vercel.com and sign up or log in. Click on the button that says Add New or Import Project. Select your GitHub repository. Vercel will automatically detect that this is a static site with no build step. Click Deploy and within a minute your site will be live with a free URL.

**On Netlify.** Go to netlify.com and sign up. Click on Import from Git. Connect your GitHub repository. Netlify will also detect this is a static site. Click Deploy and your site will be live.

**On GitHub Pages.** Go to your repository on GitHub. Click on Settings. Scroll down to the Pages section. Under Source, select the main branch and the root folder. Click Save. After a few minutes, your site will be available at your username dot github dot io slash repository name.

**On any web server.** Upload all the files using FTP or your hosting control panel. There is no special configuration needed. Just make sure the index.html file is in the root directory.

## Why I Built This Website

I built this website because JNV is important to me. When I was a student there, I did not realise how special the place was. It was only after I left that I understood what I had been given. A free education that changed my life. Friends from all over the country. Teachers who genuinely cared. Opportunities that I would never have had otherwise.

I wanted to create something that would help the school. Something that students, parents, and visitors could use to learn about JNV. Something that works well, looks professional, and does not cost anything to maintain.

I hope this website serves its purpose. And I hope it makes the school proud.

If you are a fellow Navodayan reading this, I hope this brings back good memories. If you are a parent looking for information about the school, I hope this helps you make a decision. And if you are a student currently studying at JNV, I hope you realise how lucky you are. Make the most of it.
