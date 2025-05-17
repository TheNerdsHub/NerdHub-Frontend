import React, { useEffect, useState } from 'react';
import useDocumentTitle from 'hooks/useDocumentTitle';
import 'styles/AboutPage.css';

function AboutPage() {
  useDocumentTitle('About');
  const [backendInfo, setBackendInfo] = useState({
    backendVersion: null,
    latestBackendGitTag: null,
    latestFrontendGitTag: null,
    latestDiscordGitTag: null,
    error: null,
  });
  const frontendVersion = process.env.REACT_APP_VERSION;

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_ROOT}/api/Version`)
      .then(res => res.json())
      .then(data => setBackendInfo({
        backendVersion: data.backendVersion ?? null,
        latestBackendGitTag: data.latestBackendGitTag ?? null,
        latestFrontendGitTag: data.latestFrontendGitTag ?? null,
        latestDiscordGitTag: data.latestDiscordGitTag ?? null,
        error: null,
      }))
      .catch(() => setBackendInfo(info => ({ ...info, error: 'Error fetching backend version and git tags.' })));
  }, []);

  return (
    <div className="about-page">
      <h1>About NerdHub</h1>
      <p>This page shows version information for the NerdHub frontend and backend.</p>
      <div className="about-version-section">
        <h3>Frontend Version</h3>
        <p>
          {frontendVersion ? (
            <a
              href={`https://github.com/TheNerdsHub/NerdHub-Frontend/releases/tag/${frontendVersion}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <code>{frontendVersion}</code>
            </a>
          ) : (
            <code>Loading...</code>
          )}
          {frontendVersion === "dev-prerelease" ? (
            <span className="version-status up-to-date"> (Development version, no update needed)</span>
          ) : (
            backendInfo.latestFrontendGitTag && frontendVersion && (
              frontendVersion === backendInfo.latestFrontendGitTag
                ? <span className="version-status up-to-date"> (Up to date)</span>
                : <span className="version-status out-of-date"> (Update available: {backendInfo.latestFrontendGitTag})</span>
            )
          )}
        </p>
        <h3>Latest Frontend Git Tag</h3>
        <p>
          {backendInfo.latestFrontendGitTag
            ? (
              <a
                href={`https://github.com/TheNerdsHub/NerdHub-Frontend/releases/tag/${backendInfo.latestFrontendGitTag}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <code>{backendInfo.latestFrontendGitTag}</code>
              </a>
            )
            : <code>Loading...</code>
          }
        </p>
        <h3>Backend Version</h3>
        <p>
          {backendInfo.backendVersion ? (
            <a
              href={`https://github.com/TheNerdsHub/NerdHub-Backend/releases/tag/${backendInfo.backendVersion}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <code>{backendInfo.backendVersion}</code>
            </a>
          ) : (
            <code>Loading...</code>
          )}
          {backendInfo.backendVersion === "dev-prerelease" ? (
            <span className="version-status up-to-date"> (Development version, no update needed)</span>
          ) : (
            backendInfo.latestBackendGitTag && backendInfo.backendVersion && (
              backendInfo.backendVersion === backendInfo.latestBackendGitTag
                ? <span className="version-status up-to-date"> (Up to date)</span>
                : <span className="version-status out-of-date"> (Update available: {backendInfo.latestBackendGitTag})</span>
            )
          )}
        </p>
        <h3>Latest Backend Git Tag</h3>
        <p>
          {backendInfo.latestBackendGitTag
            ? (
              <a
                href={`https://github.com/TheNerdsHub/NerdHub-Backend/releases/tag/${backendInfo.latestBackendGitTag}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <code>{backendInfo.latestBackendGitTag}</code>
              </a>
            )
            : <code>Loading...</code>
          }
        </p>
        <h3>Latest Discord Bot Git Tag</h3>
        <p>
          {backendInfo.latestDiscordGitTag
            ? (
              <a
                href={`https://github.com/TheNerdsHub/NerdHub-Discord/releases/tag/${backendInfo.latestDiscordGitTag}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <code>{backendInfo.latestDiscordGitTag}</code>
              </a>
            )
            : <code>Loading...</code>
          }
        </p>
        {backendInfo.error && <p className="about-error">{backendInfo.error}</p>}
      </div>
    </div>
  );
}

export default AboutPage;