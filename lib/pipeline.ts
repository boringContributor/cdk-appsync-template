import { Artifact } from '@aws-cdk/aws-codepipeline';
import { GitHubSourceAction } from '@aws-cdk/aws-codepipeline-actions';
import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { CdkPipeline, SimpleSynthAction } from '@aws-cdk/pipelines';

type IRepository = {
  owner: string;
  name: string;
};
// todo evaluate if gh-actions or gitlab-runner is more suitable as code pipeline is built for doing trunk based development
function CreatePipeline(stack: Stack, repo: IRepository, branchName: string) {
  // Create CodePipeline artifact to hold source code from repo
  const sourceArtifact = new Artifact();
  // Create CodePipeline artifact to hold synthesized cloud assembly
  const cloudAssemblyArtifact = new Artifact();

  const stageName = branchName === 'prod' ? 'master' : branchName;
  const pipeline = new CdkPipeline(stack, `${branchName}-Pipeline`, {
    cloudAssemblyArtifact,
    // Checkout source from GitHub - oauth error -> commented
    /*
    sourceAction: new GitHubSourceAction({
      actionName: 'Source',
      owner: repo.owner,
      repo: repo.name,
      branch: stageName,
      / -> oauthToken: SecretValue.secretsManager('GitHub') || undefined,
      output: sourceArtifact,
    }),
    */
    synthAction: SimpleSynthAction.standardNpmSynth({
      sourceArtifact,
      cloudAssemblyArtifact,
      // We override the default install command to prepare our lambda too
      installCommand: 'npm ci && npm ci --prefix lambda',
    }),
  });

  return pipeline;
}

export class Pipeline extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // todo create config
    const repository: IRepository = {
      owner: 'boringContributor',
      name: '',
    };

    CreatePipeline(this, repository, 'dev');
    CreatePipeline(this, repository, 'test');
    CreatePipeline(this, repository, 'prod');
  }
}
