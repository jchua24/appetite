A mobile app that helps users decide where to eat. 

Tech Stack: 

- Frontend: React Native
- Backend: Express 
- DB: MongoDB 
- Design: Figma 

See more at https://play.google.com/store/apps/details?id=com.parkjs.appetite&hl=en_CA&gl=US. 

# Appetite

## Demo Video
https://drive.google.com/file/d/1jGiKGla7vDXrkSPC5ZcSrzLkxg5qv6pf/view

## Description

Appetite is a mobile app for food lovers who want to discover and try new cuisines with friends, family, and partners with filters based on group preferences, type of cuisine, location, and price range. The app gamifies the process of deciding where to eat by using an innovative Tinder-style swiping interface that lets users discover and support restaurants in their area. 

We have connected our app to the Yelp API to be able to provide users high quality images, details about the restaurant and reviews. We also use a global popularity recommendation system to show restaurants sooner to a user that other users on the app have swiped right on.

The value behind the app is that it provides a simple way to quickly browse through restaurants around you without actually knowing what you want to eat in the beginning, and in future deliverables, be able to share these restaurants with friends.

## Key Features

**User Preferences**

One significant feature of the app is the recommendation of restaurants based on users' preferences. This is done by assigning different restaurant weights based on how users interacted with them (which direction they swiped). Depending on the weight that is recorded for every restaurant, the order in which it is shown to other users in the area is sorted based on weight, so a restaurant that is more popular (has a higher weight) will be shown first. 

For deliverable 2, all users share the same weights. However, for the next deliverable, these weightings will be independent for each user so that each user will have recommendations tailored to them.

**Restaurant Filtering**

Restaurants can be filtered by location, only returning restaurants within a specified radius. This feature allows users who are only looking for places to eat that is in their immediate vicinity. Currently, the range for radius is calibrated to be between 0.1km to 2km.  A user's geo-location is currently hard coded to have a latitude and longitude centered at King's College Circle for deliverable 2. In future iterations, a user's actual latitude and longitude coordinates will be passed along to the radius filter request, allowing them to filter in real-time restaurants in their area.    

Additionally, users can filter certain categories of food. Depending on what type of cuisine they are searching for such as Chinese, Vegan etc., they can narrow down their search of restaurants with those specific categories when getting recommendations. 

**Authentication**

We have a simple authentication system built for users to be able to sign up and log in. Using JSON Web Tokens for sessions, this allows users to have a fully customizable experience when interacting with the application. While this system does not anything for deliverable 2, for future deliverables we want to use user profiles to save their preferences as well as building a friend system so users can add their friends on the app, forming a social network of users that can share, interact, and connect over getting food. 

**Yelp API Integration**

We set up a REST route to perform a restaurant scrape on the Yelp API on demand. This way, if we ever want to add more restaurants in a larger radius, or from a different location, to our database, we can call this route and it queries the Yelp API multiple times and compiles the desired data. If it scrapes restaurants already existing in our database, it will simply update certain fields such as their Yelp rating, and leave others untouched. Using the Yelp API allows us to pull the latest restaurant information, as well as the most dense collection of restaurants, due to Yelp's long presence in this field.

When the user clicks "menu" to show the restaurant details, the app calls a backend route to retrieve additional details. This route interacts with the Yelp API to retrieve details including restaurant phone number, restaurant hours, 2 extra images, and the most relevant user review on the restaurant. For future deliverables we will display the extra images using a carousel.

**Tinder-Like Swipe Feature**

We implemented a tinder-like swipe feature for recommending restaurants to users. Based on the category and location filters, the app dynamically renders a stack of cards to display each recommendation with photos and restaurant details. Users can interact with the cards by pressing the like and dislike buttons or by swiping left to dislike a restaurant, and right to like a restaurant. We used a package: react-native-deck-swiper for the animation of the stack of restaurant recommendations.

## Instructions

### Accessing the deployed application

The app's Go server is currently deployed on Heroku, (automatic deploys have been disabled just in case we make non backwards compatible changes): 

[https://d2-team-project-31-appetite.herokuapp.com/](https://d2-team-project-31-appetite.herokuapp.com/)

You can download a signed Android APK here [https://drive.google.com/file/d/1Z_SJq9rJuYTRD16wPHqSXz8ooeBlIAB9/view?usp=sharing](https://drive.google.com/file/d/1Z_SJq9rJuYTRD16wPHqSXz8ooeBlIAB9/view?usp=sharing)

to use on an emulator or android phone (no iPhone app yet due to Apple developer fee). A test user has been created which you can use to sign in when you launch the app, with the following credentials:

Email: `test@test.com`

Password: `pass`

Here's a video showing a quick walkthrough of the app so far: [https://www.loom.com/share/d4fb05c35cce42089a523dbf47f8021f](https://www.loom.com/share/d4fb05c35cce42089a523dbf47f8021f)

## Deployment and Github Workflow

By effectively splitting up the tasks prior to working on the codebase, we were able to minimize merge conflicts by working on different branches and submitting pull requests due to this initial scoping out of tasks. 

Pull requests would be reviewed by the team members who would be directly impacted by the newly pushed code; in the case nobody fit this description (eg. pushing test cases or documentation), anyone who was available would review the pull request for code quality and suggestions.

However, in the interests of saving time, small changes (eg. a typo in a comment) could be pushed directly to master without opening a pull request.

Currently, mobile app deployment is automated through CircleCI as Expo handles all the mobile building and provides a link to download the APK.

The backend server is automatically deployed on Heroku on every push to the master branch.

## Development Requirements

We have provided the development requirements in the instructions section above. The server can be run on all major OS, and the app can be run on an android emulator or android phone.

## License

Our group chose an MIT license for this project.

This license allows just about anything, including commercial use, distribution, modification and private use in closed-source projects. The only conditions is that a copy of the license and copyright notice must be included with the licensed material.

Since this project was not built for a partner, we wanted the project to be open source and available for anyone who wished to modify our work. Of course, we also didn't want to be liable for issues or provide a warranty; thus, the MIT license matched our goals.

## Contributers

Rishab Luthra, Joshua Chua, Kevin Xu, Poplar Wang, Shayan Khalili-Moghaddam, Amy Gao

Note: the app was originally a group project, and since then the backend was re-written by Joshua Chua 
