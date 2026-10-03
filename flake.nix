{
  description = "Āhau v2 Holochain dev environment";

  # Holonix is Holochain's official dev environment. The branch picks the
  # Holochain line (0.6); flake.lock pins the exact versions.
  inputs = {
    holonix.url = "github:holochain/holonix?ref=main-0.6";

    nixpkgs.follows = "holonix/nixpkgs";
    flake-parts.follows = "holonix/flake-parts";
  };

  outputs = inputs@{ flake-parts, ... }: flake-parts.lib.mkFlake { inherit inputs; } {
    systems = builtins.attrNames inputs.holonix.devShells;
    perSystem = { inputs', pkgs, ... }: {
      formatter = pkgs.nixpkgs-fmt;

      # Node comes from .nvmrc (fnm/nvm), not from here, so the app and the
      # conductor tests run on the same Node.
      devShells.default = pkgs.mkShell {
        inputsFrom = [ inputs'.holonix.devShells.default ];
        packages = [ pkgs.binaryen ];
      };
    };
  };
}
