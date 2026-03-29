#!/bin/sh
# Maven Wrapper — downloads Maven 3.9.6 if not present
MAVEN_VERSION=3.9.6
MAVEN_HOME="${HOME}/.m2/wrapper/dists/apache-maven-${MAVEN_VERSION}"
MVN_URL="https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz"

if [ ! -f "${MAVEN_HOME}/bin/mvn" ]; then
    echo "Downloading Maven ${MAVEN_VERSION}..."
    # Clean up any broken/partial downloads first
    rm -rf "${MAVEN_HOME}"
    mkdir -p "${HOME}/.m2/wrapper/dists/"
    
    # Download and extract
    echo "Fetching from ${MVN_URL}"
    curl -sL "${MVN_URL}" | tar xz -C "${HOME}/.m2/wrapper/dists/"
    
    if [ ! -f "${MAVEN_HOME}/bin/mvn" ]; then
        echo "Error: Failed to download or extract Maven. Please install Maven manually."
        exit 1
    fi
fi

exec "${MAVEN_HOME}/bin/mvn" "$@"