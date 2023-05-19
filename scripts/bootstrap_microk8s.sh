if ! `which microk8s` ; then
    sudo snap install microk8s --classic --channel=1.24-eksd/stable
    sudo microk8s status --wait-ready
fi
sudo usermod -a -G microk8s $USER
sudo microk8s enable dns
sudo microk8s.config > kubeconfig.yaml
