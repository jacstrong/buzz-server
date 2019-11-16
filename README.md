# Badger Stores

## Deployment

There are currently two droplets on Digital Ocean (DO) that are hosting the staging and production environments. Stage is hosted on a 2mb, 1 core, 50 GB instance. Production is hosted on a 3mb, 1 core, 60 GB instance.

[Dokku](http://dokku.viewdocs.io/dokku) is used to release and host multiple apps on a particular instance.

On DO there is a premade droplet for Dokku, use that when a new droplet is needed.

### Steps for deployment

1. Spin up a DO instance from the Dokku image. You will need to have your ssh key configured into DO.

2. Update by running `sudo apt update` and `sudo apt upgrade`

3. Change the ssh port to 57236

    This is simply to obscure ssh and attempt to avoid problems. 57236 is arbitrary and can be changed.

    The droplets are configured with a UFW firewall that blocks all ports except for 22, 80, 443, 2375, and 2376. There is also a firewall on the DO side with the same default configuration. Port 57236 needs to be enabled by running `sudo ufw allow 57236/tcp`. You will have to use the DO interface to allow 57236

    Now edit the ssh config to allow port 57236.
    
    `vim /etc/ssh/sshd_config`

    ```
    Change line 
    # Port 22
    to
    Port 57236
    ```

    Then run `sudo service sshd restart` keep in mind your ssh session will be dropped. You will now have to connect through our port `ssh root@url.com -p 57236` you can also configure your local ssh to always connect to that port by adding the following to `./ssh/config`

    ```h
    Host url.com
        Port 57236
    ```

    Lock yourself out? Use the console on DO to go in and fix it!

    Now remove the rules allowing port 22 from both the UFW firewall and the DO firewall. Use `sudo ufw delete <rule/num>`

4. Install MongoDB for Dokku
    ```sh
    sudo dokku plugin:install https://github.com/dokku/dokku-mongo.git mongo
    ```

5. Create the Mongo instance
    ```
    export MONGO_IMAGE_VERSION="4.2"
    dokku mongo:create api
    ```

6. Install Lets Encrypt for Dokku 
    ```
    sudo dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git
    dokku config:set --global DOKKU_LETSENCRYPT_EMAIL=badgertech@pm.me
    ```

7. Add your ssh key to Dokku
    ```
    cat ~/.ssh/id_rsa.pub | ssh root@production.justtaller.com dokku ssh-keys:add admin
    ```


### Stage

There are a few minor differences between a stage and production. Mainly there are environment variables that need to be set for each.

```
dokku config:set --global STAGE=true
```

### Production/Stage

### Deploy the api

1. __Initialize the api app__
    ```
    dokku apps:create api
    ```

2. __Link MongoDB to the api__
    ```
    dokku mongo:link api api
    ```

3. __Set required environment variables.__ They are listed below. These values should not be stored in source control and should be reset if compromised. These values do change between production and stage environments so be careful.
    ```
    dokku config:set api <KEY>=<value>
    B2_BUCKET
    B2_KEY
    B2_KEY_ID
    EMAIL_PASS
    EMAIL_USER
    SQUARE_ACCESS_TOKEN
    SQUARE_BASE_PATH
    ```

4. __Push from your local repository to dokku.__
    
    You need to add the remote to your repository

    ```
    git remote add <stage/production> dokku@url.com:api
    git push <stage/production>
    ```
    The output of the build process should follow. 

5. __Point the domain to the app.__

    Make sure that the DNS is pointing to the desired location. This should be an A record.
    ```
    Host   Value
    api    000.000.000.000 (Droplet IP)
    ```

    Now configure the droplet.
    ```
    dokku domains:clear api
    dokku domains:add api api.url.com
    ```

6. __Add Let's Encrypt__

    ```
    dokku letsencrypt api
    ```
___

__You're half way there!__

![](https://media.giphy.com/media/xUPGcAnGNP5R1sJjMs/giphy.gif)

### Deploy the UIs

#### Admin

Since there is another app on admin.badgerprints.com we will use office.badgerprints.com

1. __Initialize the admin app__
    ```
    dokku apps:create admin
    ```

2. __Push local repo to the droplet__

    ```
    git remote add <stage/production> dokku@url.com:admin
    git push <stage/production>
    ```

3. __Point domain to droplet__

    ```
    Host   Value
    office    000.000.000.000 (Droplet IP)
    ```

    ```
    dokku domains:clear admin
    dokku domains:add admin office.url.com
    ```

4. __Add Let's Encrypt__

    ```
    dokku letsencrypt api
    ```

#### Store

1. __Initialize the admin app__
    ```
    dokku apps:create store
    ```

2. __Set environment variables__
    ```
    dokku config:set store VUE_APP_SQUARE_ID=<value>
    ```

2. __Push local repo to the droplet__

    ```
    git remote add <stage/production> dokku@url.com:store
    git push <stage/production>
    ```

3. __Point domain to droplet__

    ```
    Host   Value
    store    000.000.000.000 (Droplet IP)
    ```

    ```
    dokku domains:clear store
    dokku domains:add store store.url.com
    ```

4. __Add Let's Encrypt__

    ```
    dokku letsencrypt api
    ```

![](https://media.giphy.com/media/l0Iyl55kTeh71nTXy/giphy.gif)
