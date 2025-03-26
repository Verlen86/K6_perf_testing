# K6 Performance Testing Project

This project contains a K6 script for performance testing an API endpoint. The test script simulates concurrent users, dynamically populates payload data, and includes environment-based configuration for flexible testing parameters.

## Table of Contents

- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Environment Variables](#environment-variables)
  - [Explanation of Each Variable](#explanation-of-each-variable)
- [Running the Test](#running-the-test)
  - [Setup](#setup)
  - [Run the Test](#run-the-test)
  - [Run the Test with Grafana](#run-the-test-with-grafana)
- [Configuration Options](#configuration-options)
- [Results and Monitoring](#results-and-monitoring)
- [Grafana and InfluxDB Setup](#grafana-and-influxdb-setup)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
    - [Setup Instructions](#setup-instructions)
    - [Launching the Containers](#launching-the-containers)
    - [Accessing the Services](#accessing-the-services)
  - [Configuration Details](#configuration-details)
    - [Network Configuration](#network-configuration)
    - [InfluxDB](#influxdb)
    - [Grafana](#grafana)
    - [Configuration Files](#configuration-files)

## Project Structure

- **`main.js`**: The main K6 test script, configured to load test the API endpoint.

## Requirements

- **K6**: Install [K6](https://k6.io/) for running the test.
- **Environment Variables**: Ensure variables are set up as explained below.

## Environment Variables

This project uses a script-centralized configurations, making the script more flexible. Im main.js reconfigure the `// Set environment variables with fallback` section with your variables

# Target API endpoint
API_ENDPOINT=https://api-veritivaiquat3-dev.zilliant.com/v1/FormulaEvaluation/

# Authorization data for accessing the UI
USERNAME - insert the data here
PASSWORD - insert your data here

# Load test configuration
VUS=50
RAMP_UP_DURATION=50s
HOLD_DURATION=20s

Explanation of Each Variable
API_ENDPOINT: The API URL that the script will send requests to.
USERNAME: Insert your username to access the UI.
PASSWORD: Insert your password to access the UI.
VUS: Number of virtual users (VUs) to simulate in the test.
RAMP_UP_DURATION: Time to ramp up the virtual users.
HOLD_DURATION: Time to maintain the specified number of virtual users.

# Running the Test
## Setup
Ensure that variables are configured with the correct values.

## Run the Test
Use the following command to run the K6 test: `k6 run main.js`

## Run the Test with Grafana
Use the following command to run the K6 test: `k6 run --out influxdb=http://localhost:8087 main.js`. Grafana configuration is described in next section


## Configuration Options
You can adjust the following options in the script to customize the test:

VUS: Adjust to control the load on the API.
RAMP_UP_DURATION and HOLD_DURATION: Modify these values to test the API's behavior under different load conditions.
File Paths: Update PAYLOAD_FILE and CSV_FILE to point to different files if needed.

## Results and Monitoring
After running the test, K6 provides real-time results in the terminal, including request duration and success rates. For more detailed monitoring, consider integrating K6 with monitoring tools such as Grafana and InfluxDB.

# Grafana and InfluxDB Setup

This project provides a local setup for running Grafana and InfluxDB using Docker Compose. The configuration enables quick and easy provisioning of dashboards and datasources for monitoring purposes.

## Prerequisites
- **Docker**
- **Docker Compose**

## Getting Started

### Setup Instructions
1. Clone this repository to your local machine.
2. Navigate to the directory `local_grafana_influxdb` containing the `docker-compose.yml` file.

### Launching the Containers
To start both Grafana and InfluxDB, run the following command: `docker-compose up -d`

This command will start the Grafana and InfluxDB containers in detached mode.

Accessing the Services
Grafana: Open your browser and go to `http://localhost:3001`.

Grafana is set up with anonymous access enabled, allowing access to dashboards without authentication.
InfluxDB: Accessible on port 8087. You can interact with it at `http://localhost:8087`.

### Configuration Details
#### Network Configuration
The services are connected via two networks: k6 and grafana.

#### InfluxDB
Image: influxdb:1.8
Exposed Port: 8087 (mapped to internal 8086)
Default Database: k6

#### Grafana
Image: grafana/grafana:latest
Exposed Port: 3001 (mapped to internal 3000)
Anonymous Access: Enabled with admin privileges.

#### Configuration Files
Dashboards Directory: dashboards/ for custom Grafana dashboards.
Grafana Provisioning:
grafana-dashboard.yaml for dashboard provisioning.
grafana-datasource.yaml for datasource provisioning.