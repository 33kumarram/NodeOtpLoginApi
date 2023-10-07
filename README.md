# NodeOtpLoginApi

  [![License](https://img.shields.io/static/v1?label=License&message=MIT&color=blue&?style=plastic&logo=appveyor)](https://opensource.org/license/MIT)



## Table Of Content

- [Description](#description)
- [Deployed website link](#deployedWebsite)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contribution)

- [GitHub](#github)
- [Contact](#contact)
- [License](#license)




![GitHub repo size](https://img.shields.io/github/repo-size/33kumarram/NodeOtpLoginApi?style=plastic)

  ![GitHub top language](https://img.shields.io/github/languages/top/33kumarram/NodeOtpLoginApi?style=plastic)



## Description

The MERN Grocery Store Application is designed to efficiently manage product information. Within this application, users can input details about grocery items, such as their name, category, price, product image, and description. This information is then presented in a clear tabular format, complete with the relevant details and accompanying images, for easy reference.
  








## Installation

1. Clone the repository:

       git clone https://github.com/33kumarram/grocerystorebackend.git


2. Install dependencies:

       cd grocerystorebackend

       npm install


3. Set up environment variables:
  
      You will need to create a .env file in the root of the project directory, containing the following environment variables:

        MONGODB_URI= your MongoDB connection string

        APP_URL= Server url to generate url for uploaded image

        PORT = Port on which you want to run the server

4. Finally, start the server:

     npm start

     The server should now be running on port mentioned in the .env file





GroceryStoreBackEnd is built with the following tools and libraries: <ul><li>Node js </li><li>Express js </li><li>MongoDB </li><li>Multer</li><li>Multer-Gridfs-Storage</li><li>Gridfs-stram</li></ul>





## Usage
 
1. Add product detail: 


   End point = <ServerUrl>/store/addproduct

   Request Type = POST

   Body = 
   
          {
   
            "name":<Product Name>

            "category":<Product Category>

            "price":<Price of Droduct>

            "description":<Product Details>

            "image":<Url of product image>
  
          }

2. Get Products List:

   End point = <ServerUrl>/store/products

   Request Type = GET

3. Upload Image:

   End point = <ServerUrl>/files/uploadimage

   Request Type = POST

   Date : Append image as 'file' and image name as 'name' in FormData









## Contribution
 
If you would like to contribute to this project, please follow these steps:

1.Fork the repository

2.Create a new branch for your changes

3.Make your changes and commit them with descriptive commit messages

4.Push your changes to your forked repository

5.Open a pull request to merge your changes into the master branch








## GitHub

<a href="https://github.com/33kumarram"><strong>33kumarram</a></strong>



<a href="https://www.linkedin.com/in/ramesh-kumar-33613a174/">LinkedIn</a></strong></p>


<a href="https://leetcode.com/kumarram/">Leetcode</a></strong></p>





## Contact

Feel free to reach out to me on my email:
rk3790690@gmail.com





## License

[![License](https://img.shields.io/static/v1?label=Licence&message=MIT&color=blue)](https://opensource.org/license/MIT)


