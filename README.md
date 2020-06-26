# Squiggler

## Overview

A drawing game where visitors can complete drawing a doodle based on a 'squiggle' created by another user.
Users can log in, create private games and invite friends to play or simply play without logging in.
A separate gallery section shows users' creations.

This project is a fully working prototype for a game which will be part of a larger group art project.

## Technologies used

The following technologies were used in this project:

- Express with Handlebars templating
- MongoDB Atlas
- Passport.js authentication
- Webpack bundling
- SCSS
- Javascript

## Usage guide

Either navigate to the [live demo](https://squiggle-game.herokuapp.com/) or clone this repo to run the project locally.

From the home page you have three options.

- _Login_: Logging in allows you to create and delete private games and invite friends to play with you.
- _Play_: Playing the game takes you straight to the action - you are taken to a page where a squiggle is drawn on the canvas and you 'complete' it to make your own unique picture. After you submit this creation, you draw a new squiggle for a future player and the game is over.
- _Gallery_: The gallery displays finished games - you can hover/touch the squiggles to reveal a user's creation.
- (_Admin_): Admins can review reported squiggles/images and delete/restore them as appropriate.

## Build process

### Build

Firstly, a simple working version of the drawing mechanics was created using the HTML canvas element and javascript.

With a largely functional frontend in place, a (MongoDB Atlas) database was then created to store the user images and models and necessary API routes written in the Express backend.

Users and admins were then added (Passport.js for authentication and express-sessions for sessions) and finally creating private games was implemented.

### Tricky/interesting bits/features

#### Canvas drawing (CanvasComponent.js)

I chose to implement the canvas drawing myself without using any external libraries etc. I decided that it would be an interesting learning experience and it was!
The canvas drawing proved to be quite tricky for a number of reasons:

- _Smoothing_ - The most obvious and simplest implementation of drawing on the HTML canvas results in a blocky, shaky line which is not at all visually pleasing. I found a solution to this problem using a combination of canvas' quadraticCurveTo function and a border around the cursor/touch which acts as a kind of buffer region and prevents excess shakiness in the line.
- _Responsive (mobile and desktop support)_ - a series of tricky steps including checking the device pixel ratio and rescaling the canvas multiple times needed to be taken in order ensure that the squiggles (saved as coordinates) were scaled correctly on all devices and that the size of the resultant image was limited.
- _Touch devices_ - Slight tweaks in the drawing mechanics needed to be implemented for touch devices such as allowing for pinch zoom (without drawing) - uses multitouch detection and delay.

#### Private games

Added almost as an afterthought, I was please how this came together. A unique game URL is generated and can be shared to join the private game. Using sessions, users can be notified on the home page if they have a private game where it is their turn.

#### /Reporting/Admin

Due to the nature of the game, I created routes which allow users to report squiggles or pictures in the gallery. These are then immediately (current threshold:1 report) removed from the public site and can be reviewed in a private admin area. The admin can permanently delete or restore after review.

## Future features

- Progressive web app: I plan to introduce web workers in order to add notifications to the app. With native notifications, the private games will be much more successful as you will not have to go the page to see if it is your turn to play.
- The visual design of the site needs work & squiggle colours needed.
- Dark mode.
