# FROM node:14.1.0-alpine
# FROM browserless/chrome:latest
# ENV NODE_ENV=production
# WORKDIR /usr/src/app
# COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# # RUN npm install --production --silent && mv node_modules ../
# # RUN npm install
# # RUN npm install && mv node_modules ../
# COPY . .
# EXPOSE 5000
# CMD ["npm", "start"]

FROM zenika/alpine-chrome:with-node

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser
WORKDIR /usr/src/app
COPY --chown=chrome package.json package-lock.json ./
RUN npm install
COPY --chown=chrome . ./
EXPOSE 5000
CMD ["npm", "start"]
