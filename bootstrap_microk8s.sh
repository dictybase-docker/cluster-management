#!/bin/bash
dbus-uuidgen > /var/lib/dbus/machine-id
snap install microk8s --classic --channel=1.26/stable
usermod -a -G microk8s $USER
microk8s status --wait-ready
microk8s.config  > ${HOME}/kubeconfig
microk8s enable dns
