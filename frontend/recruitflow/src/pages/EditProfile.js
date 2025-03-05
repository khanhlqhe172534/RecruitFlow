import React, { useState } from "react";
import {
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  Avatar,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const EditProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    avatar: "",
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Profile Updated:", profile);
  };

  return (
    <Container className="mt-4">
      <Grid
        container
        justifyContent="center"
      >
        <Grid
          item
          xs={12}
          md={6}
        >
          <Paper
            elevation={3}
            className="p-4"
          >
            <h3 className="text-center">Edit Profile</h3>
            <form onSubmit={handleSubmit}>
              <div className="text-center mb-3">
                <Avatar
                  src={profile.avatar}
                  sx={{ width: 80, height: 80, margin: "auto" }}
                />
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  className="mt-2"
                >
                  Upload Avatar
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              </div>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                margin="normal"
                type="email"
              />
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                className="mt-3"
              >
                Save Changes
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EditProfile;
