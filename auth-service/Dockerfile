FROM quay.io/keycloak/keycloak:26.1.4

ENV KC_HTTP_ENABLED=true

COPY ./config/realm-export.json /opt/keycloak/data/import/realm.json

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]

CMD ["start-dev", "--hostname=localhost", "--import-realm", "--features=script"]
