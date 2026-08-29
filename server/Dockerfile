FROM node:18

ENV NODE_ENV=production
# Appointments store server-local midnight + a bare "HH:MM", so the join
# window is only correct while this frame stays put.
ENV TZ=Asia/Kolkata

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

EXPOSE 5000

CMD [ "node", "index.js" ]