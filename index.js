const express = require("express");
const fs = require("fs");

const users = require("./MOCK_DATA.json");

const app = express();
const port = 8000;

//middle ware plugin
app.use(express.urlencoded({extended: false}));

// pratice of middlewarwe 
app.use((req,res,next)=>{
    fs.appendFile('log.txt',
    `\n${Date.now()}:${req.ip} ${req.method}: ${req.path}\n`,
    (err,data)=>{
        next();
    })

})
  

// GET /users: Render user data in HTML format
app.get("/users", (req, res) => {
  const html = `
 <ul>
 ${users.map((user) =>`<li>${user.first_name}-${user.last_name} - ${user.gender}</li>`).join("")}
 </ul>
`;
  res.send(html);
});

// GET /api/users: Render user data in JSON format
app.get("/api/users", (req, res) => {
  return res.json(users);
});

// Route for getting user data by ID, updating, and deleting user
app.route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  })
  .patch((req, res) => {
    // getId stores the Id from the given Parameters in the URL.
    const getId = Number(req.params.id);

    // body stores the body in which we've to make changes.
    const body = req.body;

    // Finding the user Id from the user array.
    const userIndex = users.findIndex((user) => user.id === getId);

    // If we found a user with its Id then gotUser stores that object.
    if (userIndex !== -1) {
      const gotUser = users[userIndex];

      // Here gotUser has the user Object and body has the changes we have to made.
      const updatedUser = { ...gotUser, ...body };

      // After Merging them, Update the users Array.
      users[userIndex] = updatedUser;

      // Lastly, write the changes into the json file.
      fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
        return res.json({ status: "Success", updatedUser });
      });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  })

  .delete((req,res)=>{  
    //TODO: Delete the user with id
    const id = Number(req.params.id)
    if(id!=-1 && users.length>=id){
      users.splice(id-1,1);
      fs.writeFile("./MOCK_DATA.json",JSON.stringify(users),(err,data)=>{
        if(!err){
          return res.status(200).json({success:"User delete"});
        }else{
          res.status(500).json({error:"Failed to delete user"});
        }
    });
  }else{
    return res.status(404).json({error:"User not found"});
  }  
});

// POST /api/users: Create a new user
app.post("/api/users", (req, res) => {
  // Create new user (placeholder response)
  const body = req.body;    
  users.push({...body, id: users.length+1});
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users),(err,data)=>{
    return res.json({ status: "success",id: users.length });
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`The application started successfully on port ${port}`);
});



