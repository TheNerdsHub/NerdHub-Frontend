import React from 'react';
import useDocumentTitle from 'hooks/useDocumentTitle';

const Profile = ({ keycloak }) => {
  useDocumentTitle('Profile'); // Updated hook usage

  if (!keycloak.authenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p><strong>Username:</strong> {keycloak.tokenParsed?.preferred_username}</p>
      <p><strong>Email:</strong> {keycloak.tokenParsed?.email}</p>
      <p><strong>First Name:</strong> {keycloak.tokenParsed?.given_name}</p>
      <p><strong>Last Name:</strong> {keycloak.tokenParsed?.family_name}</p>
    </div>
  );
};

export default Profile;